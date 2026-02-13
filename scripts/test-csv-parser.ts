
/**
 * Test script for CSV parsing logic
 * Run with: npx ts-node scripts/test-csv-parser.ts
 */

function parseCSVLine(text: string, delimiter: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (inQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    // Escaped quote: "" -> "
                    currentValue += '"';
                    i++; // Skip next quote
                } else {
                    // Closing quote
                    inQuotes = false;
                }
            } else {
                currentValue += char;
            }
        } else {
            if (char === '"' && currentValue.length === 0) {
                // Opening quote
                inQuotes = true;
            } else if (char === delimiter) {
                // End of value
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
    }
    values.push(currentValue);
    return values;
}

const tests = [
    {
        name: 'Simple Comma',
        line: '123,PAID,John',
        delimiter: ',',
        expected: ['123', 'PAID', 'John']
    },
    {
        name: 'Simple Semicolon',
        line: '123;PAID;John',
        delimiter: ';',
        expected: ['123', 'PAID', 'John']
    },
    {
        name: 'Quoted Comma',
        line: '123,"Staus, complicated",John',
        delimiter: ',',
        expected: ['123', 'Staus, complicated', 'John']
    },
    {
        name: 'Escaped Quotes',
        line: '123,"He said ""Hello""",John',
        delimiter: ',',
        expected: ['123', 'He said "Hello"', 'John']
    },
    {
        name: 'Empty Fields',
        line: '123,,John',
        delimiter: ',',
        expected: ['123', '', 'John']
    },
    {
        name: 'Trailing Empty',
        line: '123,PAID,',
        delimiter: ',',
        expected: ['123', 'PAID', '']
    }
];

let remoteFailed = false;

tests.forEach(t => {
    const result = parseCSVLine(t.line, t.delimiter);
    const passed = JSON.stringify(result) === JSON.stringify(t.expected);
    if (passed) {
        console.log(`[PASS] ${t.name}`);
    } else {
        console.error(`[FAIL] ${t.name}`);
        console.error(`  Expected: ${JSON.stringify(t.expected)}`);
        console.error(`  Got:      ${JSON.stringify(result)}`);
        remoteFailed = true;
    }
});

if (remoteFailed) {
    console.error('Some standard tests failed.');
    process.exit(1);
} else {
    console.log('All standard tests passed.');
}
