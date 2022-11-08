const nodemailer = require('nodemailer');
const ejs = require('ejs');

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: user,
    pass: pass
  }
});

const sendEmail = (receiver, subject, date, nhl_games_today, nhl_games_yesterday, 
                    atlantic, metro, central, pacific, fantasy_leaders, top_article) => {
    ejs.renderFile(__dirname + '/templates/email.ejs', { receiver, date, nhl_games_today, nhl_games_yesterday, atlantic, metro, central, pacific, fantasy_leaders, top_article}, (err, data) => {
        if (err) {
        console.log(err);
        } else {
        var mailOptions = {
            from: from,
            to: receiver,
            subject: subject,
            html: data
        };

        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
            return console.log(error);
            }
            console.log('Email sent: %s', info.messageId);
        });
        }
    });
};

module.exports = {
  sendEmail
};
