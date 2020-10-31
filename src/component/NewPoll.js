import React from "react";
import PropTypes from "prop-types";
import "./Button.css";
import {properties} from "../properties";
import {JSON_stringify} from "../utils/printingUtils";

const url_polls = properties.backend_url.polls;
const url_admin = properties.backend_url.admin;

export default class NewPoll extends React.Component {
    user_logged = properties.user.user_name;

    state = {
        queryString: '',
        answers: '',
        groups: ''
    }

    static propTypes = {
        name: PropTypes.string,
        orange: PropTypes.bool,
        wide: PropTypes.bool,
        clickHandler: PropTypes.func,
    };

    // Sending the new poll to the telegram bot users
    sendPollToTelegram = function (poll_id) {
        var axios = require('axios');

        var config = {
            method: 'post',
            url: url_polls + '/send_poll?poll_id=' + poll_id,
            headers: { }
        };

        axios(config)
            .then(function (response) {
                console.log("sendPollToTelegram");
            })
            .catch(function (error) {
                console.error(error);
            });

    }

    // Checking if the user is the admin of a group
    // A user can't create a poll to group/s he isn't the admin of
    async isUserNameAdminForGroup(group_id) {
        let axios = require('axios');
        let data = '';
        console.log("this.user_logged:" + this.user_logged)
        if (!this.user_logged) {
            alert("Please Login")
            return false
        }

        let config = {
            method: 'get',
            url: url_admin + '/is_user_name_admin_for_group?user_name=' + this.user_logged + "&group_id=" + group_id,
            headers: {
                'Content-Type': 'application/vnd.api+json'
            },
            data: data
        };

        let r = await axios(config)
            .then(function (response) {
                console.log("isUserNameAdminForGroup\nresponse from backend:");
                console.log(JSON_stringify(response.data));
                return response.data;
            })
            .catch(function (error) {
                console.error(error);
            });
        return r;
    }

    // Creating a poll in the DB
    async postNewPoll(poll_query, answers, groups){
        let axios = require('axios');
        console.log("groups: " + groups)
        if ( !groups ) {
            groups = '0';
        }
        let data = JSON_stringify({
            "data": {
                "type": "poll",
                "attributes": {
                    "poll_question": poll_query,
                    "poll_answers": answers,
                    "groups_id": groups
                }
            }
        });

        let config = {
            method: 'post',
            url: url_polls + "/polls",
            headers: {
                'Content-Type': 'application/vnd.api+json'
            },
            data: data
        };

        let r = await axios(config)
            .then(function (response) {
                console.log("postNewPoll:");
                console.log(JSON_stringify(response.data));
                return response.data.data.id
            })
            .catch(function (error) {
                console.error(error);
                alert(error)
            });
        return r;
    }

    // Handle the data change in the form and updating the state
    updatePollValues = function () {
        return {
            queryString: document.getElementById('queryString').value,
            answers: document.getElementById('answers').value,
            groups: document.getElementById('groups').value,
        }
    }

    // Creating the poll and sending the poll to the telegram
    handleSubmitNewPoll = async () => {
        // Updating the state
        this.setState(this.updatePollValues())
        for ( const itr of this.state.groups.split('&')) {
            if (!await this.isUserNameAdminForGroup(itr)) {
                // Alerting the user is he can't create the poll because of missing roles
                alert("You are not authorize to poll the group: " + itr)
                return []
            }
        }


        console.log("handleSubmitNewPoll:")
        console.log("QueryString:" + this.state.queryString)
        console.log("Answers:" + this.state.answers)
        console.log("Groups:" + this.state.groups)

        // Update the poll to DB and then sending it to telegram users
        await this.postNewPoll(this.state.queryString, this.state.answers, this.state.groups).then((poll_id) => {
            this.sendPollToTelegram(poll_id)
        })
    }

    // Updating the state by the data from the input form
    handleChange = () =>  {
        this.setState(this.updatePollValues())
    }


    render() {
        const className = [
            "component-new-poll"
        ];

        return (
            <div className={className}>
                Create new poll:
                <form>
                    <div>
                        <div>
                            <label>
                                <input type="text"
                                       placeholder="Poll question:"
                                       onChange={this.handleChange}
                                       id="queryString"
                                       name="queryString"/>
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="text"
                                    placeholder="Answers:Ans1&Ans2&..."
                                    onChange={this.handleChange}
                                    id="answers"
                                    name="answers" />
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="text"
                                    placeholder="Groups:Group1&Group2&..."
                                    onChange={this.handleChange}
                                    id="groups"
                                    name="groups" />
                            </label>
                        </div>
                        <div>
                            <button type="button" onClick={this.handleSubmitNewPoll} className="component-new-poll-submit">Submit</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
