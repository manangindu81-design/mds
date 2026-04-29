import React from 'react';

interface Anggota {
  name: string;
}

const filteredAnggota: Anggota[] = [{ name: 'test' }];

// INVALID: () is not a valid expression in arrow function body
// Uncommenting this will cause TS1109: Expression expected
// const InvalidComponent: React.FC = () => {
//   return <div>{filteredAnggota.map((a: Anggota) => ())}</div>;
// };

// VALID: Return null explicitly
const ValidVoid1: React.FC = () => {
  return <div>{filteredAnggota.map((a: Anggota) => null)}</div>;
};

// VALID: Return undefined
const ValidVoid2: React.FC = () => {
  return <div>{filteredAnggota.map((a: Anggota) => undefined)}</div>;
};

// VALID: Use curly braces (function body) without return
const ValidVoid3: React.FC = () => {
  return <div>{filteredAnggota.map((a: Anggota) => {})}</div>;
};

// VALID: Return empty object (needs parentheses to distinguish from block)
const ValidObject: React.FC = () => {
  return <div>{filteredAnggota.map((a: Anggota) => ({}))}</div>;
};

// VALID: Return actual JSX
const ValidJSX: React.FC = () => {
  return <div>{filteredAnggota.map((a: Anggota) => <span key={a.name}>{a.name}</span>)}</div>;
};

// Test case 2: Check if ")}" is valid to close a JSX expression
const TestComponent2: React.FC = () => {
  return (
    <div>
      {(() => {
        return (
          <span>test</span>
        );
      })}
    </div>
  );
};

export default ValidJSX;
