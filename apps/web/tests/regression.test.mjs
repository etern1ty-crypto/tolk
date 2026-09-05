import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8').replace(/\s+/g,' ');
const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);

test('avatar has an actual online child and a separate clipping layer',()=>{
  assert.match(read('src/shared/ui/Avatar.tsx'),/online && <span className=\{styles\.online\}/);
  const css=read('src/shared/ui/Avatar.module.css');assert.match(css,/overflow: visible/);assert.match(css,/#22c55e/);
});
test('chat uses multiline input, deferred typing and IME-safe submit',()=>{
  const code=read('src/features/chat/ChatPanel.tsx');assert.match(code,/<AutoTextarea/);assert.match(code,/typing\.schedule\(\)/);
  assert.match(code,/!e\.nativeEvent\.isComposing/);assert.match(code,/e\.keyCode !== 229/);
  const onChange=code.slice(code.indexOf('<AutoTextarea'),code.indexOf('<AutoTextarea')+800);
  assert.doesNotMatch(onChange,/getState\(\)\.sendTypingPresence/);
});
test('recording blurs synchronously before the first capture or request',()=>{
  const code=read('src/features/chat/ChatPanel.tsx');const handler=code.slice(code.indexOf('const onRecordPointerDown'),code.indexOf('const onRecordPointerMove'));
  assert.ok(handler.indexOf('document.activeElement.blur()')<handler.indexOf('startVoiceRecording()'));
  assert.match(code,/request !== recordRequestRef\.current/);assert.match(code,/stream\.getTracks\(\)\.forEach/);
});
test('wall has no wheel trap or horizontal one-post pager',()=>{
  const code=read('src/features/wall/WallFeed.tsx');assert.doesNotMatch(code,/onWheel|desktopDeck|mobileSingleViewport|touchDeltaX/);
  assert.match(code,/<PostCard/);assert.match(code,/IntersectionObserver/);assert.match(code,/refreshFeed/);
  assert.match(read('src/features/wall/WallFeed.module.css'),/overflow-y: auto/);
});
test('sheet owns capture, cancellation, projected dismissal and retained exits',()=>{
  const code=read('src/shared/ui/Sheet.tsx');for(const token of ['setPointerCapture','onPointerCancel','projectMomentum','retained','createSpring','Drawer.Root','useVisualViewport'])assert.ok(code.includes(token),token);
  assert.doesNotMatch(code,/if \(!open\) return null/);
});
test('calls keep one remote media sink while switching presentation',()=>{
  const code=read('src/features/call/CallOverlay.tsx');assert.equal((code.match(/<video ref=\{remoteRef\}/g)||[]).length,1);
  assert.match(code,/useFloatingCall/);assert.match(code,/SwipeToAnswer/);assert.match(code,/role=\{compact \? 'region' : 'dialog'\}/);
});
test('six library-backed reactions support pointer cancellation and keyboards',()=>{
  const code=read('src/features/chat/ReactionBar.tsx');for(const token of ['gaussianScale','onPointerCancel','onLostPointerCapture','ArrowLeft','ArrowRight','setPointerCapture'])assert.ok(code.includes(token));
});
test('Sonner replaces the single string slot and mounts once at the root',()=>{
  const store=read('src/store/appStore.ts');assert.match(store,/toast as notify/);assert.doesNotMatch(store,/set\(\{ toast: msg/);
  assert.equal((read('src/main.tsx').match(/<Toast\s*\/>/g)||[]).length,1);assert.doesNotMatch(read('src/App.tsx'),/<Toast/);
});
test('new primitives are real dependencies, not placeholder implementations',()=>{
  const pkg=JSON.parse(read('package.json'));for(const name of ['cmdk','sonner','vaul'])assert.ok(pkg.dependencies[name]);
});
test('all TypeScript relative imports resolve in the archive',()=>{
  for(const file of walk(path.join(root,'src')).filter(f=>/\.[jt]sx?$/.test(f))){
    for(const match of fs.readFileSync(file,'utf8').matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)){
      const candidate=path.resolve(path.dirname(file),match[1]);
      assert.ok([candidate,...['.ts','.tsx','.js','/index.ts','/index.tsx'].map(s=>candidate+s)].some(p=>fs.existsSync(p)),`${file}: ${match[1]}`);
    }
  }
});
test('ambient blobs and rogue cyan chrome are absent',()=>{
  for(const file of walk(path.join(root,'src')).filter(f=>/\.css$|\.tsx$/.test(f))){
    assert.doesNotMatch(fs.readFileSync(file,'utf8'),/ambientBlobs|ambientBlob|#38bdf8|floatBubble/i,path.relative(root,file));
  }
});
test('feed cursor is isolated from profile posts and stale responses are ignored',()=>{
  const store=read('src/store/appStore.ts');assert.match(store,/encodeURIComponent\(feedCursor\)/);assert.match(store,/request !== feedRequest \|\| token !== get\(\)\.token/);
});
