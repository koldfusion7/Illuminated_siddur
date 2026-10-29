#!/usr/bin/env python3
"""Re-check OCR pipeline: mask logged marginalia -> deskew -> Kraken blla+BiblIA_01 (ALTO) ->
baseline-row reading order (RTL within row, initials attached) -> raw text + CER vs a reference.
Usage: pipeline.py IMG OUTSTEM [--mask x,y,w,h ...] [--ref corrected.txt]   (one side at a time)"""
import sys,os,json,re,subprocess,unicodedata,argparse
import numpy as np,cv2
import xml.etree.ElementTree as ET
KR=os.environ.get('KRAKEN_BIN','kraken')
MODEL=os.environ.get('KRAKEN_MODEL','BiblIA_01.mlmodel')  # BiblIA_01, doi:10.5281/zenodo.5468286
def deskew(g):
    b=(g<160).astype(np.uint8); h,w=b.shape; best=(0,-1)
    small=cv2.resize(b,(w//3,h//3),interpolation=cv2.INTER_AREA)
    for a in np.arange(-3,3.01,0.1):
        M=cv2.getRotationMatrix2D((small.shape[1]/2,small.shape[0]/2),a,1)
        r=cv2.warpAffine(small,M,small.shape[::-1]); p=r.sum(1).astype(float); s=((p[1:]-p[:-1])**2).sum()
        if s>best[1]: best=(a,s)
    a=round(float(best[0]),2); M=cv2.getRotationMatrix2D((w/2,h/2),a,1)
    return cv2.warpAffine(g,M,(w,h),borderValue=255),a
def rev(s): return s[::-1].translate(str.maketrans('[]()','][)('))
def lines_from_alto(f):
    L=[]
    for el in ET.parse(f).iter():
        if el.tag.endswith('TextLine'):
            txt=' '.join(s.get('CONTENT','') for s in el.iter() if s.tag.endswith('String'))
            x,y,w,h=[float(el.get(k)) for k in ('HPOS','VPOS','WIDTH','HEIGHT')]
            bl=el.get('BASELINE','')
            pts=[float(v) for v in re.split(r'[ ,]+',bl.strip()) if v] if bl else []
            by=np.mean(pts[1::2]) if pts else y+h*0.8
            L.append(dict(x=x,y=y,w=w,h=h,by=by,text=unicodedata.normalize('NFC',rev(txt)).strip()))
    return [l for l in L if l['text']]
def order(L,sidecol=False):
    if not L: return []
    mh=float(np.median([l['h'] for l in L])); mw=float(np.median([l['w'] for l in L]))
    init=[l for l in L if l['h']>1.8*mh and l['w']<0.25*mw]; body=[l for l in L if l not in init]
    body.sort(key=lambda l:l['by']); rows=[]
    for l in body:
        if rows and abs(l['by']-np.mean([r['by'] for r in rows[-1]]))<0.45*mh: rows[-1].append(l)
        else: rows.append([l])
    for i in init:  # large initial: attach to first row whose baseline lies within the initial's box, at right (RTL start)
        cand=[r for r in rows if i['y']<=np.mean([q['by'] for q in r])<=i['y']+i['h']] or [min(rows,key=lambda r:abs(np.mean([q['by'] for q in r])-(i['y']+i['h'])))]
        cand[0].append(i)
    # side-column detection: segments ending well left of the main right edge, in >=5 rows -> separate block
    R=float(np.median([l['x']+l['w'] for l in body])); side=[l for l in body if l['x']+l['w']<R-0.45*mw]
    out=[];tail=[]
    if sidecol and len(side)>=5:
        for r in rows: r[:]=[l for l in r if l not in side]
        rows=[r for r in rows if r]; tail=['[side column]']+[l['text'] for l in sorted(side,key=lambda l:l['by'])]
    for r in rows:
        r.sort(key=lambda l:-(l['x']+l['w']))  # RTL: rightmost segment first (table cells / side columns kept as printed row)
        out.append(' | '.join(l['text'] for l in r) if len(r)>1 else r[0]['text'])
    return out+tail
def norm(s):
    s=unicodedata.normalize('NFC',s).replace('˙','·'); s=re.sub(r'\[\?\]|\[illegible\]','',s); s=s.replace(' | ',' ').replace('|',' ')
    s=re.sub(r'[\u0591-\u05C7]','',s); return re.sub(r'\s+',' ',s).strip()
def lev(a,b):
    p=list(range(len(b)+1))
    for i,ca in enumerate(a,1):
        c=[i]
        for j,cb in enumerate(b,1): c.append(min(p[j]+1,c[j-1]+1,p[j-1]+(ca!=cb)))
        p=c
    return p[-1]
def score(hyp,ref):
    from collections import Counter
    a,b=norm(hyp),norm(ref); W=lambda t:Counter(norm(t).replace(':','').replace('·','').split())
    R,H=W(ref),W(hyp)
    return dict(cer=round(lev(a,b)/len(b),4),bag_WER=round(1-sum((R&H).values())/sum(R.values()),4),ref_chars=len(b))
if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('img'); ap.add_argument('out'); ap.add_argument('--mask',nargs='*',default=[]); ap.add_argument('--ref'); ap.add_argument('--reorder-only',action='store_true'); ap.add_argument('--side-column',action='store_true')
    a=ap.parse_args(); g=cv2.imread(a.img,0)
    for m in a.mask:
        x,y,w,h=map(int,m.split(',')); g[y:y+h,x:x+w]=255
    if a.reorder_only: ang=None
    else:
      g,ang=deskew(g); pre=a.out+'_prep.png'; cv2.imwrite(pre,g)
      subprocess.run([KR,'-a','-i',pre,a.out+'.xml','segment','-bl','ocr','-m',MODEL],check=True,capture_output=True)
    txt='\n'.join(order(lines_from_alto(a.out+'.xml'),a.side_column)); open(a.out+'.txt','w').write(txt+'\n')
    res=dict(deskew_deg=ang,masks=a.mask)
    if a.ref: res.update(score(txt.replace('\n',' '),open(a.ref).read().replace('\n',' ')))
    print(json.dumps(res))
