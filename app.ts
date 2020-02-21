import { Octokit } from "@octokit/rest"
import { createInterface } from "readline"
import { get } from "https";

console.log("Starting octokit...")
const octokit = new Octokit({

})

const prompt = createInterface(process.stdin, process.stdout);

(async () => {
    var [owner, repo] = (await new Promise<string>((resolve) => prompt.question("Enter repo name: ", (line) => resolve(line)))).split("/")
    console.log(`Loading repo ${repo} owned by ${owner}`)

    var issues = (await octokit.issues.listForRepo({
        owner: owner,
        repo: repo
    }))
    
    var need = issues.data.length
    var has = 0

    var updateCounter = () => {
        process.stdout.write(`\rLoaded ${has}/${need}`)
        if (has == need) {
            console.log("\nDone\n")
            for (let project of Object.keys(sortedIssues)) {
                console.log(project + ":")
                for (let issue of Object.keys(sortedIssues[project])) {
                    let issueData = sortedIssues[project][issue]
                    console.log(`  ${issue} [${issueData.labels.map(v => v.name).join(",")}]`)
                }
            }
        }
    }

    var sortedIssues = {} as { [project: string]: { [name: string]: typeof issues.data[0] } }

    updateCounter()
    issues.data.forEach(v => {
        get(v.html_url, (res) => {
            if (res.statusCode !== 200) {
                res.resume();
                has++
                updateCounter()
            } else {
                res.setEncoding('utf8')
                let rawData = ''
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    var match = rawData.match(/<span class="css-truncate css-truncate-target width-fit">(.*)<\/span>/g)
                    if (match.length > 0) {
                        let project = match[0].substr(`<span class="css-truncate css-truncate-target width-fit">`.length)
                        project = project.substr(0, project.length - `</span>`.length)
                        if (!(project in sortedIssues)) sortedIssues[project] = {}
                        sortedIssues[project][v.title] = v
                    }
                    has++
                    updateCounter()
                })
            }
        })
    })
})()