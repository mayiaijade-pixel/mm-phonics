import {spawnSync} from 'node:child_process';
const args=process.env.MM_HOSTING_TARGET==='sites'?['scripts/run-framework.mjs','build']:['node_modules/next/dist/bin/next','build','--webpack'];
const r=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});if(r.error)throw r.error;process.exit(r.status??1);
