import React from "react";
import PropTypes from "prop-types";
import "./Button.css";
import Chart from "react-google-charts";
import {properties} from "../properties";
import {JSON_stringify} from "../utils/printingUtils";
import GroupAdmin from "./GroupAdmin";
import NewPoll from "./NewPoll";

const url_polls = properties.backend_url.polls;
const url_groups = properties.backend_url.group;
const url_answer = properties.backend_url.answer;

export default class Polls extends React.Component {
    user_logged = properties.user.user_name;
    constructor(props) {
        super(props);
        this.createSelectItemsGroups = this.createSelectItemsGroups.bind(this);
        this.createSelectItemsPolls = this.createSelectItemsPolls.bind(this);
    }
    state = {
        pollTitle: '',
        poll_name: '',
        // Loaded poll_id
        poll_id: 0,
        // Selected poll_id(Not the loaded poll)
        poll_id_dropdown: 0,
        // Poll answering options
        poll_group_options: ['Answers Options'],
        // Selected answer option.
        // Used to create a group by answer
        poll_group_options_selected: '',
        pollTitle_dropdown: 'Please select a poll',
        poll_list: [{poll_id: 0, title: "Please select a poll"}],
        // Poll answer option selected
        poll_answer_selected: '',
        chartEvents: [
            {
                eventName: "select",
                callback({ chartWrapper }) {
                    console.log("Selected ", chartWrapper.getChart().getSelection());
                }
            }
        ],
        data: []
    }

    static propTypes = {
        name: PropTypes.string,
        orange: PropTypes.bool,
        wide: PropTypes.bool,
        clickHandler: PropTypes.func,
    };

    sendToTelegram = async () => {
        if (!await this.checkIfUserIsAdmin()) {
            alert("You are not an admin of all the poll groups");
            return;
        }

        let axios = require('axios');

        let config = {
            method: 'post',
            url: url_polls + '/send_poll?poll_id=' + this.state.poll_id,
            headers: {}
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    // Used for creating a group by answer option
    handleSubmitCreateGroup = async () => {
        // Check if user isn't the admin of all the poll group
        if (!await this.checkIfUserIsAdmin()) {
            alert("You are not an admin of all the poll groups");
            return;
        }
        if ( this.state.poll_group_options_selected === 'Answers Options' ) {
            alert("Please select answer option");
            return;
        }
        console.log("handleSubmitCreateGroup:")
        console.log(this.state.poll_group_options_selected)
        console.log("group_name: " + this.state.group_name)

        const request = require('request');
        const options = {
            'method': 'POST',
            'url': url_groups + '/make_group?poll_id=' + this.state.poll_id
                + '&answer=' + this.state.poll_group_options_selected
                + '&name=' + this.state.group_name,
            'headers': {
                'Content-Type': 'application/json'
            }
        };
        request(options, function (error, response) {
            if (error) {
                console.error(error);
                alert("Could not create a group")
            }
            console.log(response.body);
        });
    }


    // Submit an answer to poll
    handleSubmitAnswer = async () => {
        console.log("handleSubmitAnswer:")
        console.log("Answer: " + this.state.poll_answer_selected)


        const request = require('request');
        const options = {
            'method': 'POST',
            'url': url_answer + '/insert_answer?poll_id=' + this.state.poll_id
                + '&answer=' + this.state.poll_answer_selected
                + '&user_name=' + this.user_logged,
            'headers': {
                'Content-Type': 'application/json'
            }
        };
        request(options, function (error, response) {
            if (error) {
                console.error(error);
            }
            console.log(response.body);
        });
        // Changing the loaded poll chart data after the user answered
        await this.handleSubmitPollId();
    }

    // Loading the polls that the user is a member of the poll groups
    async getUserPollIdsList() {
        let axios = require('axios');
        let data = '';
        console.log("this.user_logged:" + this.user_logged)
        if (!this.user_logged) {
            alert("Please Login")
            return [0]
        }

        let config = {
            method: 'get',
            url: url_polls + '/get_user_polls?user_name=' + this.user_logged,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        let r = await axios(config)
            .then(function (response) {
                console.log("getPollsList\nresponse from backend:");
                console.log(JSON_stringify(response.data));
                let tmp_arr = [{poll_id: 0, title: "Please select a poll"}];
                // Change to google charts format
                response.data.forEach(function (itr) {
                    tmp_arr.push({poll_id: itr.id, title: itr.poll_question})
                });
                return tmp_arr;
            })
            .catch(function (error) {
                console.error(error);
            });
        return r;
    }

    // Returns the poll data in google charts format
    // Used to display the selected poll from dropdown menu
    async getPollData(poll_id) {
        let axios = require('axios');
        let data = '';

        let config = {
            method: 'get',
            url: url_polls + '/get_poll_data?poll_id=' + poll_id,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        let r = await axios(config)
            .then(function (response) {
                console.log("getPollData\nresponse from backend:");
                console.log(JSON_stringify(response.data));
                return response.data
            })
            .catch(function (error) {
                console.error(error);
            });
        return r;
    }

    // Getting the poll answering options
    // Used to generate the dropdown menus
    async getPollOptions(poll_id) {
        var axios = require('axios');
        var data = '';

        var config = {
            method: 'get',
            url: url_polls + '/get_poll_options?poll_id=' + poll_id,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        let r = await axios(config)
            .then(function (response) {
                let tmp_arr = ['Answers Options'];
                // Change to google charts format
                response.data.forEach(function (itr) {
                    tmp_arr.push(itr)
                });
                console.log(JSON_stringify(tmp_arr));
                return tmp_arr;
            })
            .catch(function (error) {
                console.error(error);
            });
        return r;
    }

    // Gets the user answer to the poll or empty string
    async get_user_answer_to_poll_selected(poll_id) {
        let axios = require('axios');
        let data = '';
        const params = 'poll_id=' + poll_id + '&user_name=' + this.user_logged

        let config = {
            method: 'get',
            url: url_answer + '/get_user_answer_to_poll?' + params,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        let r = await axios(config)
            .then(function (response) {
                console.log("get_user_answer_to_poll\nresponse from backend:");
                console.log(JSON_stringify(response.data));
                return response.data
            })
            .catch(function (error) {
                console.error(error);
            });
        return r;
    }

    // Updating the loaded poll and dropdowns
    updatePollValues = async function () {
        const poll_id_dropdown = await this.getPollData(this.state.poll_id_dropdown);
        const poll_dropdown_title = this.state.pollTitle_dropdown;
        return {
            pollTitle: poll_dropdown_title,
            poll_id: this.state.poll_id_dropdown,
            data: poll_id_dropdown,
        }
    }

    // Handler for the select poll.
    // Update all poll data in UI(dropdowns&chart)
    handleSubmitPollId = async () => {
        let options_list = await this.getPollOptions(this.state.poll_id_dropdown)
        let poll_group_options_selected_temp = await this.get_user_answer_to_poll_selected(this.state.poll_id_dropdown)
        // If the user answered then this will be the default value
        // If not then the first option is the default
        let poll_group_options_selected = poll_group_options_selected_temp === '' ?
            'Answers Options' :
            poll_group_options_selected_temp
        console.log('poll_group_options_selected:')
        console.log(JSON_stringify(poll_group_options_selected))
        this.setState({
            poll_list: await this.getUserPollIdsList(),
            poll_group_options: options_list,
            poll_group_options_selected: 'Answers Options',
            poll_answer_selected: poll_group_options_selected_temp
        })
        this.setState(await this.updatePollValues())
    }


    drawChart = () => {
        if (this.state.poll_id === 0)
            return ("")
        return (
            <Chart
                width={'800px'}
                height={'700px'}
                chartType="PieChart"
                loader={<div>Loading Chart</div>}
                data={this.state.data}
                options={{
                    title: this.state.pollTitle,
                    is3D: true,
                    sliceVisibilityThreshold: 0
                }}
            />
        );
    };

    // Creating the dropdown for the create group by the answering options of the poll
    createSelectItemsGroups() {
        let items = [];
        this.state.poll_group_options.forEach((T) => {
            items.push(<option key={T} value={T}>{T}</option>);
        })
        return items;
    }

    // Creating the dropdown for the polls list
    createSelectItemsPolls() {
        let items = [];
        this.state.poll_list.forEach((T) => {
            items.push(<option key={T.poll_id} value={T.poll_id}>{T.title}</option>);
        })
        return items;
    }

    // Updating the answer option selected in create group dropdown menu
    handleChangeGroupOption = async (event) => {
        console.log("handleChangeGroupOption: ", event.target.value);
        this.setState({
            poll_group_options_selected: event.target.value
        })
    }


    // Updating the answer option selected in submit poll answer dropdown menu
    handleChangeAnswer = async (event) => {
        console.log("handleChangeAnswer: ", event.target.value);
        this.setState({
            poll_answer_selected: event.target.value
        })
    }

    // Updating the name of the group before creating it
    handleChangeGroupName = async (event) => {
        this.setState({
            group_name: event.target.value
        })
    }

    // Updating the selected poll in state
    // Not loading it yet
    handleChange = async (event) => {
        console.log("poll_id_dropdown:", event.target.value);
        let temp = this.state.poll_list.find(function (T) {
            if (T.poll_id == event.target.value)
                return T;
        });
        console.log("temp.title:", temp.title);
        console.log("temp.poll_id:", temp.poll_id);
        this.setState({
            poll_id_dropdown: temp.poll_id,
            pollTitle_dropdown: temp.title,
        });
    }

    //  Checking if the user currently logged in is the admin of the all the selected poll groups
    async checkIfUserIsAdmin() {
        const groupAdmin = new GroupAdmin();
        const newPoll = new NewPoll();
        let user_groups_admin = await groupAdmin.getGroupsList(this.user_logged);
        let user_groups_admin_str = ""
        user_groups_admin.forEach( (itr) => {
            console.log(itr)
            if (itr.group_id !== -1) {
                console.log(itr.group_id)
                user_groups_admin_str +=  (itr.group_id);

            }
        })
        console.error(JSON_stringify(user_groups_admin_str))
        return newPoll.isUserNameAdminForGroupList(user_groups_admin_str)
    }

    render() {
        const className = [
            "component-poll"
        ];
        return (
            <div className={className}>
                <div>
                    <form>
                        <div className="component-poll-header">
                            Load poll:
                        </div>
                        <label>
                            <select onChange={this.handleChange}>
                                {this.createSelectItemsPolls()}
                            </select>
                        </label>
                        <button type="button" onClick={this.handleSubmitPollId} className="component-poll-id">
                            Load
                        </button>
                        <button type="button" onClick={this.sendToTelegram} className="component-poll-id-telegram">
                            Send Telegram Notification
                        </button>
                    </form>
                    <form className="component-poll-create-group">
                        <div className="component-poll-header">
                            Create group from poll results
                        </div>
                        <label>
                            <select onChange={this.handleChangeGroupOption}>
                                {this.createSelectItemsGroups()}
                            </select>
                        </label>
                        <label>
                            <input
                                type="text"
                                placeholder="Group name"
                                onChange={this.handleChangeGroupName}
                                id="group_name"
                                name="group_name" />
                        </label>
                        <button type="button" onClick={this.handleSubmitCreateGroup} className="component-poll-id">
                            Create group
                        </button>
                    </form>
                    <form className="component-poll-answer">
                        <div className="component-poll-header">
                            Answer poll:
                        </div>
                        <label>
                            <select onChange={this.handleChangeAnswer} value={this.state.poll_answer_selected}>
                                {this.createSelectItemsGroups()}
                            </select>
                        </label>
                        <button type="button" onClick={this.handleSubmitAnswer} className="component-poll-id">
                            Submit answer
                        </button>
                    </form>
                </div>
                <div>
                    {this.drawChart()}
                </div>
            </div>
        )
    }
}



