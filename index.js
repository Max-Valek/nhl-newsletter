const express = require("express");
var http = require('http');
var path = require('path');
const puppeteer = require('puppeteer');
const cron = require('node-cron');
const { sendEmail } = require("./email");
const sportsData = require('./sportsData')
const articles = require('./articles')

const app = express();
const server = http.Server(app)
const port = process.env.PORT || 3000

app.set("port", port)
app.use(express.json())
app.use(express.urlencoded({extended:true}))

let subscribers = ['']

server.listen(port, () => {

    cron.schedule('* * 10 * * *', async () => {
        const browser = await puppeteer.launch()
        
        let nhl_games_today = await sportsData.getGames(browser)
        let nhl_games_yesterday = await sportsData.getYesterday(browser)
        let standings = await sportsData.getStandings(browser)
        let atlantic = standings.slice(0, 8)
        let metro = standings.slice(8, 16)
        let central = standings.slice(16, 24)
        let pacific = standings.slice(24, 32)
        let fantasy_leaders = await sportsData.getYesterdayFantasy(browser)
        let top_article = await articles.getArticles(browser)
        
        await browser.close()

        const d = new Date()
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        const day = d.getDate()
        const date = `${month}/${day}/${year}`

        for(let i=0; i<subscribers.length; i++){
            sendEmail(
                subscribers[i],
                "NHL Newsletter",
                date,
                nhl_games_today,
                nhl_games_yesterday,
                atlantic,
                metro,
                central,
                pacific,
                fantasy_leaders,
                top_article
            );
        }
    })

});
