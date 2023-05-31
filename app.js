const prompts = require('prompts') 
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
let validate




// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }
  
  /**
   * Load or request or authorization to call APIs.
   *
   */
  async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    return client;
  }
  



// console.log('welcome to the scheduler')

const start = async() => {

    const response = await prompts(prompt)

    const {summary, startDate, endDate, location, startTime, endTime,} = response
   
    const event = {
      summary,
      location,
      start: {
        dateTime:`${startDate}T${startTime}+01:00`
      },
      end: {
        dateTime:`${endDate}T${endTime}+01:00`
      }
    }

    console.log(`auth: ${validate}`)
    console.log(JSON.stringify(event))
   
    const eventStr = JSON.stringify(event)

   createSchedule(validate,eventStr)


}

const prompt = [

    {
        type: 'text',
        name: 'auth',
        message: 'do you want to add a scnedule to you calender?',
        validate: auth => {
            const formattedValue = auth.toLowerCase()[0]
            
             switch(formattedValue){
                case 'y': return scheduler()
                case 'n': process.exit(0);
                default: console.log('invalid option, run again');
                process.exit(1)
            }

        }
    },
    {
        type: 'text',
        name: 'summary',
        message: 'give a summary of the event',  
    },
    {
        type: 'text',
        name: 'startDate',
        message: 'give a start date format:2015-10-01', 
   
    },
    {
        type: 'text',
        name: 'endDate',
        message: 'give a end date format:2015-10-01', 

    },
    {
      type: 'text',
      name: 'startTime',
      message: 'give a start time format:09:00:00', 

  },
  {
    type: 'text',
    name: 'endTime',
    message: 'give a end time format:12:00', 

},
    {
        type: 'text',
        name: 'location',
        message: 'give a location'
    }
    
]



const scheduler = async()=> {
    console.log('aurthorizing.....')
    try {
        const auth = await authorize()
        console.log('authorized')
        validate = auth
        return auth
    } catch (error) {
        console.log('authorization failed')
    }
    
    
}

const createSchedule = async (auth,event) => {

  const calendar = google.calendar({version: 'v3', auth});

 calendar.events.insert({
    auth,
    calendarId: 'primary',
    resource: event,
  },(err,event)=>{
    if(err){
      console.log('There was an error contacting the Calendar service: ' + err.message);
    return;
    }
    console.log('Event created: %s', event.htmlLink);
  })

}

start()
