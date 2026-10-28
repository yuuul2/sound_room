const {spawnSync}=require('node:child_process');
const result=spawnSync(process.platform==='win32'?'npx.cmd':'npx',['expo','export','--platform','web','--output-dir','dist-web'],{stdio:'inherit',env:{...process.env,SOUND_ROOM_WEB_BASE_PATH:'/sound_room',EXPO_NO_TELEMETRY:'1'}});
if(result.error)throw result.error;
process.exitCode=result.status??1;
if(result.status===0){const fs=require('node:fs');fs.writeFileSync('dist-web/.nojekyll','');}
