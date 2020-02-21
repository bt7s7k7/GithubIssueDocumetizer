import { Octokit } from "@octokit/rest"
import { createInterface } from "readline"
import { promisify } from "util"

const octokit = new Octokit({

})

const prompt = createInterface(process.stdin, process.stdout);

(async ()=>{
    var name = await new Promise<string>((resolve)=>prompt.question("Enter repo name: ", (line)=>resolve(line)))
    console.log(`Loading repo ${name}`)
})()