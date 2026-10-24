import { gsap } from 'gsap';

console.log('--- Test 1: tl.set before tl.to at the same position ---');
const obj1 = { x: 0 };
const tl1 = gsap.timeline();
tl1.set(obj1, { x: 100 }, 1.0);
tl1.to(obj1, { x: 0, duration: 1.0, ease: 'none' }, 1.0);

tl1.seek(1.0);
console.log('Test 1 at t=1.0: x =', obj1.x);
tl1.seek(1.5);
console.log('Test 1 at t=1.5: x =', obj1.x);
tl1.seek(2.0);
console.log('Test 1 at t=2.0: x =', obj1.x);

console.log('\n--- Test 2: tl.fromTo with function-based from ---');
const obj2 = { x: 0 };
const tl2 = gsap.timeline();
let computedStart = 100;
tl2.fromTo(obj2, { x: () => computedStart }, { x: 0, duration: 1.0, ease: 'none' }, 1.0);

tl2.seek(1.0);
console.log('Test 2 at t=1.0: x =', obj2.x);
tl2.seek(1.5);
console.log('Test 2 at t=1.5: x =', obj2.x);
tl2.seek(2.0);
console.log('Test 2 at t=2.0: x =', obj2.x);

console.log('\n--- Test 3: Precomputing offsets at init time ---');
// Can we compute the offsets at init time?
// Let's check!
