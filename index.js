/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Session State: Handles a multi-turn dialog model.
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 * - SSML: Using SSML tags to control how Alexa renders the text-to-speech.
 *
 * Examples:
 * Dialog model:
 *  User: "Alexa, ask Wise Guy to tell me a knock knock joke."
 *  Alexa: "Knock knock"
 *  User: "Who's there?"
 *  Alexa: "<phrase>"
 *  User: "<phrase> who"
 *  Alexa: "<Punchline>"
 */

/**
 * App ID for the skill
 */
var APP_ID = 'amzn1.ask.skill.e073d6df-b71d-4d36-90e6-fa696701a730';

var WORD_LIST = ["chair", "table", "pen", "computer", "pencil", "eraser", 
                 "fan", "light", "bed","stove","car","cup","toothbrush",
                 "guitar","phone","book","aeroplane","bottle","shirt","pant"];

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * RememberMeSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var RememberMeSkill = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
RememberMeSkill.prototype = Object.create(AlexaSkill.prototype);
RememberMeSkill.prototype.constructor = RememberMeSkill;

/**
 * Overriden to show that a subclass can override this function to initialize session state.
 */
RememberMeSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // Any session init logic would go here.
};

/**
 * If the user launches without specifying an intent, route to the correct function.
 */
RememberMeSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("RememberMeSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

    handleLaunchRequest(session, response);
};

/**
 * Overriden to show that a subclass can override this function to teardown session state.
 */
RememberMeSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    //Any session cleanup logic would go here.
};

RememberMeSkill.prototype.intentHandlers = {
    "LaunchIntent": function (intent, session, response) {
        handleLaunchRequest(session, response);
    },
    "NumberOfWordsIntent": function (intent, session, response) {
    	handleUserInputForNumberOfWords(intent, session, response);
    },
    "WordRecognitionIntent": function (intent, session, response) {
    	handleUserInputForWordRecognition(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "";

        switch (session.attributes.stage) {
            case 0:
                speechText = "Knock knock jokes are a fun call and response type of joke. " +
                    "To start the joke, just ask by saying tell me a joke, or you can say exit.";
                break;
            case 1:
                speechText = "You can ask, who's there, or you can say exit.";
                break;
            case 2:
                speechText = "You can ask, who, or you can say exit.";
                break;
            default:
                speechText = "Knock knock jokes are a fun call and response type of joke. " +
                    "To start the joke, just ask by saying tell me a joke, or you can say exit.";
        }

        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        // For the repromptText, play the speechOutput again
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

function handleLaunchRequest(session, response){
	console.log("Enter handleLaunchRequest");
    var speechText = "Remember Me is a memorization game where we read out random words and " +
    		" you are challenged to repeat them back in any order! Please say how many words you want" +
    		" you want to remember? Max you can select is 10 words";
    session.attributes.stage = 0;
    //Reprompt speech will be triggered if the user doesn't respond.
    var repromptText = "You can say any number between 1 and 10";
    var speechOutput = {
        speech: '<speak>' + speechText + '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: '<speak>' + repromptText + '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    };
    response.askWithCard(speechOutput, repromptOutput, "Remember Me", speechText);
}

function handleUserInputForNumberOfWords(intent, session, response) {
    var speechText = "";
    //Check if session variables are already initialized.
//    if (session.attributes.stage) {
        //Ensure the dialogue is on the correct stage.
        if (session.attributes.stage === 0) {
            //The user is trying to say the number of words
        	var number = intent.slots.NumberOfWords.value;
        	var list = [];
        	if(number > 0 && number < 11){
        		speechText = "So here are your "+number+" words:";
        		// Randomly select words and read out to user
			var temp = number;
        		while(temp !== 0){
        			var wordID = Math.floor(Math.random() * WORD_LIST.length);
				if(list.indexOf(WORD_LIST[wordID]) < 0){
        				list.push(WORD_LIST[wordID]);
        				speechText = speechText +" "+ WORD_LIST[wordID]+"<break time=\"1s\"/>";
					temp = temp-1;
				}
        		}      	  		
               		session.attributes.stage = 1;
			// Store the words as part of session
			session.attributes.list = list;
        	} else {
                speechText = "Please say a valid number between one and ten";
        	}
        } else {
            //The user attempted to jump to the intent of another stage.
            session.attributes.stage = 0;
            speechText = "Do you want to start the game again?";
        }
//    } else {
//        speechText = "bye bye!";
//    }
    var repromptText = "bye bye!";
    var speechOutput = {
        speech: '<speak>' + speechText + '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: '<speak>' + repromptText + '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    };
    response.askWithCard(speechOutput, repromptOutput, "Remember Me", speechText);
}

function handleUserInputForWordRecognition(intent, session, response) {
    var speechText = "So you said these words right: ";
        //Ensure the dialogue is on the correct stage.
        if (session.attributes.stage === 1) {
           	//The user is trying to say the words
		// First get the list of words the user is supposed to say
		var expectedList = session.attributes.list;
		var unExpectedList = [];
		if(intent.slots.word_one.value !== undefined) {
			speechText = speechText + intent.slots.word_one.value + "<break time=\"1s\"/>";
			var index = expectedList.indexOf(intent.slots.word_one.value);
			if(index >= 0){
				// Delete from the expected list
				expectedList.splice(index,1);
			} else {
				unExpectedList.push(intent.slots.word_one.value);
			}
		}
		if(intent.slots.word_two.value !== undefined) {
			speechText = speechText + intent.slots.word_two.value + "<break time=\"1s\"/>";
			var index = expectedList.indexOf(intent.slots.word_two.value);
			if(index >= 0){
				// Delete from the expected list
				expectedList.splice(index,1);
			} else {
				unExpectedList.push(intent.slots.word_two.value);
			}
		}
		if(intent.slots.word_three.value !== undefined) {
			speechText = speechText + intent.slots.word_three.value + "<break time=\"1s\"/>";	
			var index = expectedList.indexOf(intent.slots.word_three.value);
			if(index >= 0){
				// Delete from the expected list
				expectedList.splice(index,1);
			} else {
				unExpectedList.push(intent.slots.word_three.value);
			}
		}
		if(intent.slots.word_four.value !== undefined) {
			speechText = speechText + intent.slots.word_four.value + "<break time=\"1s\"/>";
			var index = expectedList.indexOf(intent.slots.word_four.value);
			if(index >= 0){
				// Delete from the expected list
				expectedList.splice(index,1);
			} else {
				unExpectedList.push(intent.slots.word_four.value);
			}	
		}
		if(intent.slots.word_five.value !== undefined) {
			speechText = speechText + intent.slots.word_five.value + "<break time=\"1s\"/>";
			var index = expectedList.indexOf(intent.slots.word_five.value);
			if(index >= 0){
				// Delete from the expected list
				expectedList.splice(index,1);
			} else {
				unExpectedList.push(intent.slots.word_five.value);
			}	
		}
		if(intent.slots.word_six.value !== undefined) {
			speechText = speechText + intent.slots.word_six.value + "<break time=\"1s\"/>";
			var index = expectedList.indexOf(intent.slots.word_six.value);
			if(index >= 0){
				// Delete from the expected list
				expectedList.splice(index,1);
			} else {
				unExpectedList.push(intent.slots.word_six.value);
			}	
		}
		if(intent.slots.word_seven.value !== undefined) {
			speechText = speechText + intent.slots.word_seven.value + "<break time=\"1s\"/>";
			var index = expectedList.indexOf(intent.slots.word_seven.value);
			if(index >= 0){
				// Delete from the expected list
				expectedList.splice(index,1);
			} else {
				unExpectedList.push(intent.slots.word_seven.value);
			}	
		}
		if(intent.slots.word_eight.value !== undefined) {
			speechText = speechText + intent.slots.word_eight.value + "<break time=\"1s\"/>";
			var index = expectedList.indexOf(intent.slots.word_eight.value);
			if(index >= 0){
				// Delete from the expected list
				expectedList.splice(index,1);
			} else {
				unExpectedList.push(intent.slots.word_eight.value);
			}	
		}
		if(intent.slots.word_nine.value !== undefined) {
			speechText = speechText + intent.slots.word_nine.value + "<break time=\"1s\"/>";
			var index = expectedList.indexOf(intent.slots.word_nine.value);
			if(index >= 0){
				// Delete from the expected list
				expectedList.splice(index,1);
			} else {
				unExpectedList.push(intent.slots.word_nine.value);
			}	
		}
		if(intent.slots.word_ten.value !== undefined) {
			speechText = speechText + intent.slots.word_ten.value + "<break time=\"1s\"/>";
			var index = expectedList.indexOf(intent.slots.word_ten.value);
			if(index >= 0){
				// Delete from the expected list
				expectedList.splice(index,1);
			} else {
				unExpectedList.push(intent.slots.word_ten.value);
			}	
		}
		// Tell user what words he missed
		if(expectedList.length > 0) {
			speechText = speechText + " And you missed following words ";
			for(var i=0; i<expectedList.length; i++) {
				speechText = speechText + expectedList[i] + "<break time=\"1s\"/>";
			}
		}
		session.attributes.stage = 2;		
        } else {
            //The user attempted to jump to the intent of another stage.
            session.attributes.stage = 0;
            speechText = "Do you want to start the game again?";
        }
    var repromptText = "bye bye!";
    var speechOutput = {
        speech: '<speak>' + speechText + '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: '<speak>' + repromptText + '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    };
    response.askWithCard(speechOutput, repromptOutput, "Remember Me", speechText);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Remember Me Skill.
    var skill = new RememberMeSkill();
    skill.execute(event, context);
};