interface Anggota { name: string; }
const filteredAnggota: Anggota[] = [];

// This line demonstrates the INVALID syntax
// Uncomment to see: TS1109: Expression expected.
// const result = filteredAnggota.map((a: Anggota) => ());

// The arrow function body "()" contains only empty parentheses.
// In JavaScript, "()" alone is not a valid expression
// (it's a grouping operator that requires an inner expression).
