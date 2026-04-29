// Pure TypeScript test - no JSX needed
interface Anggota { name: string; }
const filteredAnggota: Anggota[] = [];

// Test 1: Is "(a: Anggota) => ()" valid?
// Result: INVALID - TS1109: Expression expected.
// The arrow function body "()" is an empty grouping operator with no expression inside.
// Fix: Use null, undefined, {}, ({}), or a real expression

// Uncomment to see error:
// const x = filteredAnggota.map((a: Anggota) => ());
// error TS1109: Expression expected.

// Test 2: Valid alternatives
const a1 = filteredAnggota.map((a: Anggota) => null);      // OK
const a2 = filteredAnggota.map((a: Anggota) => undefined); // OK
const a3 = filteredAnggota.map((a: Anggota) => {});        // OK (empty block, returns undefined)
const a4 = filteredAnggota.map((a: Anggota) => ({}));      // OK (empty object literal)
const a5 = filteredAnggota.map((a: Anggota) => a.name);    // OK

// Test 3: ")}" closing context
// In JSX, the following pattern uses ")}" to close:
// <div>{(function(){ return <span/>; })()}</div>
// The ")}" closes the IIFE parentheses inside the JSX braces - this is valid.
