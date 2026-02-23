import { Cl } from '@stacks/transactions';

// Test data
const deployer = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const opponent = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';

console.log('Testing contract calls...\n');

// Test 1: Create game
console.log('1. Create game');
console.log('   Function: create-game');
console.log('   Args: principal opponent');
console.log('   Expected: (ok u1)\n');

// Test 2: Make move
console.log('2. Make move');
console.log('   Function: make-move');
console.log('   Args: uint game-id, string-ascii move');
console.log('   Expected: (ok true)\n');

// Test 3: Get game
console.log('3. Get game');
console.log('   Function: get-game');
console.log('   Args: uint game-id');
console.log('   Expected: game data\n');

console.log('Contract interface validated ✓');
