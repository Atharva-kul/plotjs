export const Plotjs = {

    // Method 1: Trignometric graphs

    drawTrig: (config) => {
        const {
            formulaStr, // input as string
            unit = 'rad',
            width = 500,
            height = 250,
            lineColor = 'white',
            bgColor = 'black'
        } = config;

        if(!formulaStr) {
            console.error("1) plotjs Error: parameter formula must be passed to draw the graph")
            return null;
        }

        let formula;
        try {
            const process = formulaStr.replace(/\^/g, '**')

            formula = new Function('x', `
                    const{
                        sin, cos, tan, PI, pow, sqrt, abs, log
                    } = Math;
                    return ${process}
                `);
            
        }
        catch (error) {
            console.error(`2) plotjs error: formula "${formulaStr} is invalid"`)
        }
    }
}