const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const getArticles = async (browser) => {
    const page = await browser.newPage()
    await page.goto(`https://www.espn.com/nhl/`)
    await sleep(3000)
    let article = []
    const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".media-wrapper_image img")).map(x => x.src)
    })

    const titles = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".contentItem__titleWrapper > h1")).map(x => x.textContent)
    })

    const summaries = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".contentItem__titleWrapper > p")).map(x => x.textContent)
    })

    const authors = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".contentMeta__author")).map(x => x.textContent)
    })

    const timestamps = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".contentMeta__timestamp")).map(x => x.textContent)
    })

    article.push(
        {
            title:titles[0],
            image:images[0],
            summary:summaries[0],
            author:authors[0],
            timestamp:timestamps[0]
        }
    )

    return article
}

exports.getArticles = getArticles