
# NMailer

Node.js Gmail Autoresponder: A Node.js application that automatically responds to incoming emails in your Gmail mailbox. It utilizes the Gmail API and OAuth2 authentication for email retrieval and sending. The app identifies first-time email threads, sends replies, and maintains the thread context. Built with modern JavaScript standards, Promises, and async/await for clean and readable code. Implements secure and reliable email sending using Nodemailer. Features include label tagging, random interval processing, and configurable authentication. Developed as a programming exercise.


## Documentation

[Used Google's Gmail API](https://developers.google.com/gmail/api/guides)

[Used nodemailer library](https://nodemailer.com/about/)
## configExample file

To run this project, you will need to change the details of the configExample file. 
First change the data of the file with your respective api credentials, also refer to the file for assistance.
Then change the file name to config.js for it to be used in the code.



## Possible Improvements
There can be many improvements that can be done to the code.

1. Can be improved by using Authorization tokens. Currently it uses refresh tokens to authenticate and using those refresh tokens it can get new access tokens. The user explicitly grants permissions to the application, giving them more control over the granted access and with short lifespan of authorization tokens it reduces unauthorized access if a token is compromised.

2. Code can be improved to read multiple emails rather than getting only the data of a single email.

