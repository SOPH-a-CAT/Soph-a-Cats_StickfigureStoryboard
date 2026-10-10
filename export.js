let videoExport=null,videoURL=null;
function exportFrame(c,scenes,seconds){let remaining=seconds;for(let i=0;i<scenes.length;i++){const s=scenes[i];if(remaining<s.duration||i===scenes.length-1){render(c,s,Math.min(remaining,s.duration));return}remaining-=s.duration}}
function mp4Mime(){if(typeof MediaRecorder==='undefined')return null;return ['video/mp4;codecs=avc1.42E01E','video/mp4;codecs=avc1','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type))||null}
function finishExportUI(message){$('exportStatus').textContent=message;$('cancelExport').textContent='Close';$('exportVideo').disabled=false;videoExport=null}
function cancelVideoExport(message='Export canceled. Your storyboard is still saved.'){const job=videoExport;if(!job)return;job.canceled=true;clearTimeout(job.timer);if(job.recorder.state!=='inactive')job.recorder.stop();job.stream.getTracks().forEach(track=>track.stop());finishExportUI(message)}
$('cancelExport').onclick=()=>{cancelVideoExport();$('exportDialog').close()};$('exportDialog').addEventListener('cancel',()=>cancelVideoExport());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&videoExport)cancelVideoExport('Export stopped because the tab was hidden. Keep this tab visible and try again.');});
$('exportVideo').onclick=()=>{
 if(videoExport)return;
 stop();moviePlaying=false;$('moviePlay').textContent='▶ Play all scenes';
 const dialog=$('exportDialog'),canvas=$('exportCanvas'),context=canvas.getContext('2d');
 $('exportProgress').value=0;$('videoDownload').hidden=true;$('cancelExport').textContent='Cancel';$('exportStatus').textContent='Getting your scenes ready…';dialog.showModal();
 const mime=mp4Mime();if(!mime||!canvas.captureStream){finishExportUI('This browser cannot make MP4 videos. Open this site in an up-to-date Chrome, Edge, or Safari browser and try again.');return}
 const scenes=structuredClone(project.scenes),length=scenes.reduce((sum,s)=>sum+s.duration,0);let stream,recorder;
 try{exportFrame(context,scenes,0);stream=canvas.captureStream(30);recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:4000000});if(!recorder.mimeType.startsWith('video/mp4'))throw Error('MP4 encoder unavailable');}
 catch(error){stream?.getTracks().forEach(track=>track.stop());finishExportUI('Could not start the MP4 export. Try again in an up-to-date Chrome, Edge, or Safari browser.');return}
 const job={stream,recorder,chunks:[],canceled:false,timer:null};videoExport=job;$('exportVideo').disabled=true;
 recorder.ondataavailable=event=>{if(event.data.size)job.chunks.push(event.data)};
 recorder.onerror=()=>cancelVideoExport('The video encoder stopped. Please try exporting again.');
 recorder.onstop=async()=>{
  clearTimeout(job.timer);stream.getTracks().forEach(track=>track.stop());if(job.canceled)return;
  $('exportStatus').textContent='Finishing your MP4…';
  try{const blob=new Blob(job.chunks,{type:'video/mp4'});const header=new Uint8Array(await blob.slice(0,64).arrayBuffer());const valid=header.length>12&&String.fromCharCode(...header.slice(4,8))==='ftyp';if(!valid||!blob.size)throw Error('Invalid MP4');if(job.canceled)return;
   if(videoURL)URL.revokeObjectURL(videoURL);videoURL=URL.createObjectURL(blob);const link=$('videoDownload');link.href=videoURL;link.download=(project.title||'stickfigure-storyboard').replace(/[^a-z0-9_-]+/gi,'-').slice(0,80)+'.mp4';link.hidden=false;link.click();$('exportProgress').value=100;finishExportUI('Your MP4 is ready! If the download did not start, tap Download MP4 again.');
  }catch(error){finishExportUI('The browser could not finish a valid MP4. Please try exporting again.');}
 };
 let start;
 function frame(){if(job.canceled)return;const elapsed=Math.min(length,(performance.now()-start)/1000);exportFrame(context,scenes,elapsed);$('exportProgress').value=Math.floor(elapsed/length*100);$('exportStatus').textContent='Making your video… '+Math.floor(elapsed/length*100)+'% · about '+Math.max(0,Math.ceil(length-elapsed))+' seconds left';if(elapsed>=length){recorder.stop();return}job.timer=setTimeout(frame,1000/30)}
 try{recorder.start(1000);start=performance.now();frame()}catch(error){cancelVideoExport('Could not start recording the video. Please try again.')}
};
