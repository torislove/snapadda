console.log("WAITING TO IMPORT...");
import('./api/index.js').then(() => console.log("FINISHED IMPORT")).catch(e => console.error("ERROR", e));
