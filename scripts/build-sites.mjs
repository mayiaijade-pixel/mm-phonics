import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['/Users/jade/.codex/plugins/cache/openai-curated-remote/sites/1.1.2/scripts/build-site.mjs'],{stdio:'inherit',env:{...process.env,MM_HOSTING_TARGET:'sites'}});if(r.error)throw r.error;process.exit(r.status??1);
