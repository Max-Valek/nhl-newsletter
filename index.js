const express = require("express");
var http = require('http');
var path = require('path');
const puppeteer = require('puppeteer')
const { sendEmail } = require("./email");
const sportsData = require('./sportsData')
const articles = require('./articles')

const app = express();
const server = http.Server(app)
const port = 3000

app.set("port", port)
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, "static")))


let subscribers = ['nhlnewsletter@gmail.com','maxcodestuff@gmail.com','curtmurphy28@gmail.com']

const addSubscriber = (addr) => {
    if (!subscribers.includes(addr)){
        subscribers.push(addr)
        return true
    }else {
        return false
    }
}

const removeSubscriber = (addr) => {
    if (subscribers.includes(addr)){
        for(let i=0; i<subscribers.length; i++){
            if(subscribers[i] === addr){
                subscribers.splice(i, 1)
                return true
            }
        }
    }
    return false
}

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "static/index.html"))
})

app.get("/subscribed", function(req, res) {
    res.sendFile(path.join(__dirname, "static/newSub.html"))
})

app.get("/alreadySubbed", function(req, res) {
    res.sendFile(path.join(__dirname, "static/alreadySubscribed.html"))
})
app.get("/unsubscribed", function(req, res) {
    res.sendFile(path.join(__dirname, "static/unsubscribe.html"))
})

app.get("/notSubbed", function(req, res) {
    res.sendFile(path.join(__dirname, "static/notSubbed.html"))
})

app.post("/subscribe", async (req, res) => {
    let sub = req.body.address
    let added = addSubscriber(sub)
    if(added){
        res.redirect("/subscribed");
    }else {
        res.redirect("/alreadySubbed");
    }
    console.log(subscribers)
    
});

app.post("/unsubscribe", async (req, res) => {
    let sub = req.body.address
    let removed = removeSubscriber(sub)
    if(removed){
        res.redirect("/unsubscribed");
    }else {
        res.redirect("/notSubbed");
    }
    console.log(subscribers)
    
});

app.post("/send_email", async (req, res) => {
    // let to = req.body.to
    const browser = await puppeteer.launch()
    
    // let nhl_games_today = await sportsData.getGames(browser)
    // let nhl_games_yesterday = await sportsData.getYesterday(browser)
    // let standings = await sportsData.getStandings(browser)
    // let atlantic = standings.slice(0, 8)
    // let metro = standings.slice(8, 16)
    // let central = standings.slice(16, 24)
    // let pacific = standings.slice(24, 32)
    // let fantasy_leaders = await sportsData.getYesterdayFantasy(browser)
    // let top_article = await articles.getArticles(browser)
    
    let nhl_games_today = []
    let nhl_games_yesterday = []
    let standings = []
    let atlantic = []
    let metro = []
    let central = []
    let pacific = []
    let fantasy_leaders = []
    let top_article = [{title: '',image: '',summary: "",author: '',timestamp: ''}]
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
    
    res.redirect("/");
});

server.listen(port, () => {
  console.log("Listening on port: " + port);
});