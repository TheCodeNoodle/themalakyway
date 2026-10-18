"""Import open song metadata and trim user-supplied audio. Run from project root."""
import json, pathlib, urllib.request, urllib.parse, time, re, sys, subprocess, zipfile, io, csv
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.tools/python'))
import imageio_ffmpeg
SONGS=[
 ('Margaret','Lana Del Rey feat. Bleachers','Lana Del Rey - Margaret (Audio) ft. Bleachers.mp3',82.8,'Lana Del Rey'),
 ('All the Stars','Kendrick Lamar & SZA','Kendrick Lamar, SZA - All The Stars.mp3',43,'Kendrick Lamar'),
 ('Lover Girl','Laufey','Laufey - Lover Girl (Official Music Video).mp3',31,'Laufey'),
 ('Army Dreamers','Kate Bush','Army Dreamers (2018 Remaster).mp3',40.5,'Kate Bush'),
 ('K.','Cigarettes After Sex','K. - Cigarettes After Sex.mp3',82.4,'Cigarettes After Sex'),
 ('Indigo Night','Tamino','Tamino - Indigo Night.mp3',132.5,'Tamino'),
 ('Smooth Operator','Sade','Sade - Smooth Operator.mp3',110.5,'Sade'),
 ('The Night We Met','Lord Huron','Lord Huron - The Night We Met (Official Audio).mp3',87.5,'Lord Huron'),
 ('Orange-coloured day','liana flores','liana flores - Orange-coloured day (visualizer).mp3',40,'liana flores'),
 ('Salvatore','Lana Del Rey','Lana Del Rey - Salvatore (Audio).mp3',88.3,'Lana Del Rey')
]
def get(url):
 req=urllib.request.Request(url,headers={'User-Agent':'BirthdaySkyLocal/1.0 (personal offline metadata import)'})
 return urllib.request.urlopen(req,timeout=40).read()
def timings():
 result=[]
 for title,artist,filename,start,search_artist in SONGS:
  try:
   data=json.loads(get('https://lrclib.net/api/get?'+urllib.parse.urlencode({'artist_name':search_artist,'track_name':title})))
   lines=[]
   for m in re.finditer(r'\[(\d+):(\d+\.\d+)\][ \t]*(.*)',data.get('syncedLyrics') or ''):
    lines.append((int(m[1])*60+float(m[2]),m[3]))
   result.append({'title':title,'duration':data['duration'],'lines':lines})
  except Exception as e: result.append({'title':title,'error':str(e)})
  time.sleep(1.1)
 (ROOT/'tools/clip-timings.json').write_text(json.dumps(result,ensure_ascii=False),encoding='utf8')
def catalog():
 existing=ROOT/'tools/song-catalog.json'
 rows=json.loads(existing.read_text(encoding='utf8')) if existing.exists() else []
 # A compact CC0 song-data file, with popular decoys from the CoSoD corpus.
 archive=zipfile.ZipFile(io.BytesIO(get('https://raw.githubusercontent.com/duguay-michele/CoSoD/main/Metadata.zip')))
 for name in archive.namelist():
  if name.lower().endswith('.csv') and '__macosx' not in name.lower():
   data=list(csv.reader(io.StringIO(archive.read(name).decode('utf-8-sig'))))
   for row in data[1:]:
    if len(row)>=5 and row[3].strip(): rows.append({'title':row[3].strip(),'artist':row[4].strip()})
 for artist in dict.fromkeys(s[4] for s in SONGS):
  if any('mbid' in r and artist.casefold() in r['artist'].casefold() for r in rows):continue
  try:
   url='https://musicbrainz.org/ws/2/recording/?'+urllib.parse.urlencode({'query':f'artist:"{artist}"','fmt':'json','limit':100})
   data=json.loads(get(url))
   for r in data.get('recordings',[]):
    credit=''.join(c.get('name','')+c.get('joinphrase','') for c in r.get('artist-credit',[]))
    rows.append({'title':r['title'],'artist':credit,'mbid':r['id']})
  except Exception as e: print('Metadata request failed:',artist,e)
  time.sleep(1.2)
 rows.extend({'title':s[0],'artist':s[1]} for s in SONGS)
 unique={}
 for row in rows:
  key=(row['title'].casefold(),row['artist'].casefold())
  if key not in unique:unique[key]=row
 result=sorted(unique.values(),key=lambda r:(r['title'].casefold(),r['artist'].casefold()))
 (ROOT/'dist/song-catalog.js').write_text('window.discoSongCatalog = '+json.dumps(result,ensure_ascii=False)+';\n',encoding='utf8')
 (ROOT/'tools/song-catalog.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
 print('Bundled song suggestions:',len(result))
def clips():
 ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
 config=json.loads((ROOT/'tools/disco-clips.json').read_text()) if (ROOT/'tools/disco-clips.json').exists() else [dict(title=s[0],artist=s[1],source=s[2],start=s[3]) for s in SONGS]
 for i,s in enumerate(config):
  target=ROOT/f'dist/music/track-{i+1:02}.mp3'
  subprocess.run([ffmpeg,'-y','-v','error','-ss',str(s['start']),'-i',str(pathlib.Path.home()/'Downloads'/s['source']),'-t','15','-vn','-af','afade=t=in:d=0.06,afade=t=out:st=14.8:d=0.2','-ar','44100','-ac','2','-b:a','160k','-map_metadata','-1',str(target)],check=True)
  print(s['title'],s['start'],target.stat().st_size)
 (ROOT/'tools/disco-clips.json').write_text(json.dumps(config,indent=2),encoding='utf8')
if __name__=='__main__':
 for task in sys.argv[1:]: {'timings':timings,'catalog':catalog,'clips':clips}[task]()
