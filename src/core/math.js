export const _createFormula = (formulaStr, args) => {
    // 1. Security Check
    const allowedPattern = /^(?:[xt0-9.+\-/*^()\s]|sin|cos|tan|sec|cot|cosec|pow|sqrt|abs|log|PI|E|\^)+$/;
    if (!allowedPattern.test(formulaStr)) {
        console.error(`Plotjs Security Error: The formula "${formulaStr}" contains unauthorized characters.`);
        return null;
    }

    try {
        // 2. Prepare the formula body for the new Function
        const processedFormula = formulaStr.replace(/\^/g, '**'); // Use standard exponentiation
        
        const functionBody = `
            // Make only approved Math functions available in scope
            const { sin, cos, tan, PI, E, pow, sqrt, abs, log } = Math;
            
            // Define custom helper functions
            const sec = (a) => 1 / cos(a);
            const cot = (a) => 1 / tan(a);
            const cosec = (a) => 1 / sin(a);

            // Calculate and return the result
            const result = ${processedFormula};
            
            // Ensure the result is a finite number
            return Number.isFinite(result) ? result : null;
        `;

        // 3. Create and return the function
        return new Function(...args, functionBody);

    } catch (error) {
        // 4. Handle any syntax errors
        console.error(`Plotjs Error: The formula "${formulaStr}" is invalid.`);
        return null;
    }
};