
const getGames = async (browser) => {
    const page = await browser.newPage()
    await page.goto(`https://www.espn.com/nhl/scoreboard`)

    let games = []
    // get text
    const times = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".ScoreboardScoreCell__Time")).map(x => x.textContent)
    })
    const networks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".ScoreCell__NetworkItem")).map(x => x.textContent)
    })
    let net
    for (let i=0; i<networks.length; i++){
        if(networks[i].includes('|')){
            net = networks[i].split('|')
            networks[i] = `${net[0]} | ${net[1]}`
        }
    }
    const teams = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".ScoreCell__Truncate--scoreboard")).map(x => x.textContent)
    })

    const logos = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".ScoreboardScoreCell__Logo")).map(x => x.src)
    })
    const records = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".ScoreboardScoreCell__Record")).map(x => x.textContent)
    })

    let odds = await getOdds(browser)
    let teams_w_odds = []
    for(let i=0; i<teams.length; i++){
        for(let j=0; j<odds.length; j++){
            if(teams[i] === odds[j].team){
                teams_w_odds.push(odds[j])
                break
            }
        }
    }

    for (let i = 0; i<times.length; i++){
        if (i === 0){
            games.push({time:times[i], network:networks[i], team1_logo:logos[i], team2_logo:logos[i+1], team1_record:records[i], team2_record:records[i+1], team1:teams_w_odds[i], team2:teams_w_odds[i+1]})
        }else {
            games.push({time:times[i], network:networks[i], team1:teams_w_odds[i*2], team2:teams_w_odds[(i*2)+1], team1_logo:logos[i*2], team2_logo:logos[(i*2)+1], team1_record:records[i*2], team2_record:records[(i*2)+1]})
        }
    }
    return games
}

const getOdds = async (browser) => {
    const page = await browser.newPage()
    await page.goto(`https://sportsbook.draftkings.com/leagues/hockey/nhl?wpsrc=Organic%20Search&wpaffn=Google&wpkw=https%3A%2F%2Fsportsbook.draftkings.com%2Fleagues%2Fhockey%2Fnhl&wpcn=leagues&wpscn=hockey%2Fnhl`)
    let odds = []
    let pl_pms = []
    let pl_odds = []
    let OU_nums = []
    let OU_odds = []
    let OUs = []
    let moneylines = []

    const teams = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".event-cell__name-text")).map(x => {
            let full = x.textContent
            let short = full.slice(3)
            return short.trim()
        })
    })

    const lines = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".sportsbook-outcome-cell__line")).map(x => x.textContent)
    })

    for(let i=0; i<lines.length; i++){
        if(i%2 === 0){
            pl_pms.push(lines[i])
        }else{
            OU_nums.push(lines[i])
        }
    }

    const odds_all = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".sportsbook-odds")).map(x => x.textContent)
    })

    const OU = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".sportsbook-outcome-cell__label")).map(x => x.textContent)
    })

    for(let i=0; i<odds_all.length; i+=3){
        pl_odds.push(odds_all[i])
        OU_odds.push(odds_all[i+1])
        moneylines.push(odds_all[i+2])
    }

    
    for(let i=0; i<OU_nums.length; i++){
        OUs.push(`${OU[i]} ${OU_nums[i]}`)
    }

    for (let i = 0; i<teams.length; i++){
        odds.push({team:teams[i], pl_pm:pl_pms[i], pl_odd:pl_odds[i], ou:OUs[i], ou_odds:OU_odds[i], ml:moneylines[i]})
    }

    return odds
}

const getStandings = async (browser) => {
    const page = await browser.newPage()
    await page.goto(`https://www.espn.com/nhl/standings`)
    let standings = []
    const teams = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".Logo__sm")).map(x => x.title)
    })
    const logos = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".Logo__sm")).map(x => x.src)
    })
    // console.log(logos)
    const stats = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".Table__TD > .stat-cell")).map(x => x.textContent)
    })

    for(let i=0; i<teams.length; i++){
        if(i === 0){
            standings.push(
                {
                    team:teams[i],
                    logo:logos[i],
                    gp:stats[0],
                    w:stats[1],
                    l:stats[2],
                    otl:stats[3],
                    pts:stats[4],
                    rw:stats[5],
                    row:stats[6],
                    sow:stats[7],
                    sol:stats[8],
                    home:stats[9],
                    away:stats[10],
                    gf:stats[11],
                    ga:stats[12],
                    diff:stats[13],
                    l10:stats[14],
                    strk:stats[15]
                }
            )
        } else {
            standings.push(
                {
                    team:teams[i],
                    logo:logos[i],
                    gp:stats[16*i],
                    w:stats[(16*i) + 1],
                    l:stats[(16*i) + 2],
                    otl:stats[(16*i) + 3],
                    pts:stats[(16*i) + 4],
                    rw:stats[(16*i) + 5],
                    row:stats[(16*i) + 6],
                    sow:stats[(16*i) + 7],
                    sol:stats[(16*i) + 8],
                    home:stats[(16*i) + 9],
                    away:stats[(16*i) + 10],
                    gf:stats[(16*i) + 11],
                    ga:stats[(16*i) + 12],
                    diff:stats[(16*i) + 13],
                    l10:stats[(16*i) + 14],
                    strk:stats[(16*i) + 15]
                }
            )
        }
        
    }

    return standings
}

const getYesterday = async (browser) => {
    const page = await browser.newPage()
    let d = new Date()
    // console.log(d)
    d.setDate(d.getDate() - 1)
    let month = d.getMonth() + 1
    let year = d.getFullYear()
    let day = d.getDate()
    if(day < 10){
        day = `0${day}`
    }
    let date = `${year}${month}${day}`
    // console.log(date)
    await page.goto(`https://www.espn.com/nhl/scoreboard/_/date/${date}`)

    let games = []
    // get text

    const teams = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".ScoreCell__Truncate--scoreboard")).map(x => x.textContent)
    })

    const logos = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".ScoreboardScoreCell__Logo")).map(x => x.src)
    })
    // push the info to the games array
    const records = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".ScoreboardScoreCell__Record")).map(x => x.textContent)
    })

    const scores = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".ScoreCell_Score--scoreboard")).map(x => x.textContent)
    })

    for (let i = 0; i<teams.length/2; i++){
        if (i === 0){
            games.push({team1:teams[i], team2:teams[i+1], team1_logo:logos[i], team2_logo:logos[i+1], team1_record:records[i], team2_record:records[i+1], team1_score:scores[i], team2_score:scores[i+1]})
        }else {
            games.push({team1:teams[i*2], team2:teams[(i*2)+1], team1_logo:logos[i*2], team2_logo:logos[(i*2)+1], team1_record:records[i*2], team2_record:records[(i*2)+1], team1_score:scores[i*2], team2_score:scores[(i*2)+1]})
        }
    }

    return games
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const getYesterdayFantasy = async (browser) => {
    const page = await browser.newPage()
    
    const d = new Date()
    let month = d.getMonth() + 1
    let year = d.getFullYear()
    let day = d.getDate()
    
    const date1 = new Date('10/31/2022');
    const date2 = new Date(`${month}/${day}/${year}`);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const scoringPeriod = 24 + diffDays


    await page.goto(`https://fantasy.espn.com/hockey/leaders?statSplit=singleScoringPeriod&scoringPeriodId=${scoringPeriod}`)
    await sleep(3000)
    let leaders = []

    const players = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".truncate")).map(x => x.textContent)
    })
    const ps = players.filter((player) => player != "")
    // top 5 players
    const topFive = ps.slice(0,5)

    const player_teams = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".playerinfo__playerteam")).map(x => x.textContent)
    })
    const teams = player_teams.slice(0,5)

    const player_pos = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".playerinfo__playerpos")).map(x => x.textContent)
    })
    const positions = player_pos.slice(0,5)

    const photos = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".player-headshot > img")).map(x => x.src)
    })
    let headshots = []
    for(let i=0; i<10; i+=2){
        headshots.push(photos[i])
    }

    const total = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".total")).map(x => x.textContent)
    })

    // top 5 fantasy points
    const fp = total.slice(1,6)

    const g = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".stat-g")).map(x => x.textContent)
    })
    const goals = g.slice(1, 6)

    const a = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".stat-a")).map(x => x.textContent)
    })
    const assists = a.slice(1, 6)

    const pppoints = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".stat-ppp")).map(x => x.textContent)
    })
    const ppps = pppoints.slice(1, 6)

    const shpoints = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".stat-shp")).map(x => x.textContent)
    })
    const shps = shpoints.slice(1, 6)

    const shots = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".stat-sog")).map(x => x.textContent)
    })
    const sog = shots.slice(1, 6)

    const h = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".stat-hit")).map(x => x.textContent)
    })
    const hits = h.slice(1, 6)

    const blk = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".stat-blk")).map(x => x.textContent)
    })
    const blocks = blk.slice(1, 6)

    for(let i=0; i<topFive.length; i++){
        leaders.push({
            player:topFive[i],
            team:teams[i],
            pos:positions[i],
            image:headshots[i],
            points:fp[i],
            g:goals[i],
            a:assists[i],
            ppp:ppps[i],
            shp:shps[i],
            shots:sog[i],
            h:hits[i],
            blk:blocks[i]
        })
    }
    return leaders
}

exports.getGames = getGames
exports.getOdds = getOdds
exports.getYesterday = getYesterday
exports.getStandings = getStandings
exports.getYesterdayFantasy = getYesterdayFantasy