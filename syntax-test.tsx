interface Anggota { name: string; }
const filteredAnggota: Anggota[] = [];

// SYNTAX TEST - save as .tsx and compile with next.js/tsc
// 1. INVALID: arrow function body "()" is not a valid expression
// return <div>{filteredAnggota.map((a: Anggota) => ())}</div>;
// Error: TS1109: Expression expected.

// 2. VALID alternatives:
//    - null:  => null
//    - undefined: => undefined
//    - empty block: => {}
//    - empty object literal: => ({})
//    - any expression: => <span/>

// 3. JSX closing: ")}" is valid when closing an expression wrapped in parens
// Example: {(function(){ return <span/>; })}
// The ")}" closes the IIFE parentheses inside the JSX braces
