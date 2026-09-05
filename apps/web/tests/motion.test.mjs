import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, rubberBand, projectMomentum, gaussianScale, releaseVelocity, springStep, createSpring } from '../src/shared/lib/motion.ts';
import { popoverPosition } from '../src/shared/lib/popover.ts';
import { createTypingThrottle } from '../src/shared/lib/typingThrottle.ts';
import { triggerHaptic } from '../src/shared/lib/haptics.ts';

const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('rubber-band matches the directive, with signed resistance', () => {
  near(rubberBand(100, 300), 100 * 300 * 0.55 / (300 + 0.55 * 100));
  near(rubberBand(-100, 300), -rubberBand(100, 300));
  assert.equal(rubberBand(0), 0);
  assert.ok(rubberBand(1000, 300) < 300);
});
test('momentum projects px/s using the 0.998 exponential rate', () => {
  near(projectMomentum(42, 1000), 541); near(projectMomentum(42, -1000), -457);
  assert.equal(projectMomentum(42, 0), 42);
});
test('Gaussian reaction scale is symmetric, bounded and peaks at 1.58', () => {
  near(gaussianScale(0), 1.58); near(gaussianScale(26), gaussianScale(-26));
  assert.ok(gaussianScale(26) < gaussianScale(0)); assert.ok(gaussianScale(1000) >= 1);
});
test('velocity comes from recent samples, not total gesture duration', () => {
  near(releaseVelocity([{position:0,time:0},{position:50,time:950},{position:100,time:1000}],1000),1000);
  assert.equal(releaseVelocity([{position:100,time:800}],1000),0);
  assert.equal(releaseVelocity([{position:1,time:10},{position:2,time:10}],10),0);
});
test('critical spring converges without overshoot', () => {
  let state={position:0,velocity:0};
  for(let i=0;i<180;i++) {const prev=state.position;state=springStep(state.position,state.velocity,100,1/60);
    assert.ok(state.position>=prev-1e-9 && state.position<=100+1e-9);}
  near(state.position,100,0.01);
});
test('spring handoff preserves the pointer release velocity', () => {
  const next=springStep(30,400,100,0.00001);
  near((next.position-30)/0.00001,400,0.1);
});
test('spring solution is independent of 60 vs 120 Hz sampling', () => {
  const run=(hz)=>{let s={position:120,velocity:-300};for(let i=0;i<hz;i++)s=springStep(s.position,s.velocity,0,1/hz);return s;};
  near(run(60).position,run(120).position);near(run(60).velocity,run(120).velocity);
});
test('momentum spring allows subtle overshoot, then settles', () => {
  let state={position:0,velocity:0},maximum=0;
  for(let i=0;i<180;i++){state=springStep(state.position,state.velocity,1,1/120,0.8,0.35);maximum=Math.max(maximum,state.position);}
  assert.ok(maximum>1&&maximum<1.05);near(state.position,1,0.01);
});
test('popover clamps every edge and retains the pointer origin', () => {
  for(const [x,y] of [[0,0],[389,843],[195,422]]) {
    const p=popoverPosition(x,y,280,356,390,844);
    assert.ok(p.left>=8&&p.left+280<=382);assert.ok(p.top>=8&&p.top+356<=836);
    assert.equal(p.transformOrigin,`${x-p.left}px ${y-p.top}px`);
  }
});
test('clamp handles viewports smaller than the requested interval', () => {
  assert.equal(clamp(-10,8,4),8); assert.equal(clamp(500,8,382),382);
});
test('typing sends no synchronous work, no more than once per 3000ms', (t) => {
  let now=0, sent=0;t.mock.method(performance,'now',()=>now);
  t.mock.timers.enable({apis:['setTimeout']});
  const throttle=createTypingThrottle(()=>sent++);
  for(let i=0;i<100;i++)throttle.schedule();assert.equal(sent,0);
  t.mock.timers.tick(1);assert.equal(sent,1);
  now=2999;throttle.schedule();t.mock.timers.tick(1);assert.equal(sent,1);
  now=3000;throttle.schedule();assert.equal(sent,1);t.mock.timers.tick(1);assert.equal(sent,2);
});
test('typing pending work is cancelled on send, switch or unmount', (t) => {
  t.mock.timers.enable({apis:['setTimeout']});let sent=0;
  const throttle=createTypingThrottle(()=>sent++);throttle.schedule();throttle.cancel();t.mock.timers.tick(10000);assert.equal(sent,0);
});
test('spring can be interrupted from the live presentation value', (t) => {
  const saved={raf:globalThis.requestAnimationFrame,caf:globalThis.cancelAnimationFrame,window:globalThis.window};
  let id=0,now=0;const frames=new Map();
  globalThis.requestAnimationFrame=(cb)=>{frames.set(++id,cb);return id;};
  globalThis.cancelAnimationFrame=(n)=>frames.delete(n);
  globalThis.window={matchMedia:()=>({matches:false})};t.mock.method(performance,'now',()=>now);
  const step=()=>{now+=16;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(cb=>cb(now));};
  try {let drawn=0;const s=createSpring(0,v=>drawn=v);s.to(100,{velocity:300});step();const live=s.value;
    assert.ok(live>0&&live<100);s.stop();step();assert.equal(s.value,live);s.to(-50,{velocity:-100});assert.equal(s.value,live);
    step();assert.ok(s.value<live);assert.equal(drawn,s.value);s.stop();assert.equal(frames.size,0);
  } finally {if(saved.raf)globalThis.requestAnimationFrame=saved.raf;else delete globalThis.requestAnimationFrame;
    if(saved.caf)globalThis.cancelAnimationFrame=saved.caf;else delete globalThis.cancelAnimationFrame;
    if(saved.window)globalThis.window=saved.window;else delete globalThis.window;}
});
test('reduced motion jumps to the result with a single completion callback', () => {
  const oldW=globalThis.window, oldC=globalThis.cancelAnimationFrame;
  globalThis.window={matchMedia:()=>({matches:true})};globalThis.cancelAnimationFrame=()=>{};
  try {let value=0,completed=0;const s=createSpring(0,v=>value=v);s.to(120,{onRest:()=>completed++});assert.equal(value,120);assert.equal(completed,1);}
  finally {if(oldW)globalThis.window=oldW;else delete globalThis.window;if(oldC)globalThis.cancelAnimationFrame=oldC;else delete globalThis.cancelAnimationFrame;}
});
test('haptic enhancement is harmless without browser vibration support', () => {assert.doesNotThrow(()=>triggerHaptic('success'));});
