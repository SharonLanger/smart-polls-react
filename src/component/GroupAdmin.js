import React from "react";
import PropTypes from "prop-types";
import "./Button.css";
import {properties} from "../properties";
import {JSON_stringify} from "../utils/printingUtils";

const url_group_users = properties.backend_url.group_users;
const url_admin = properties.backend_url.admin;

export default class GroupAdmin extends React.Component {
    user_logged = properties.user.user_name;
    constructor(props) {
        super(props);
        this.handleCheckboxListChange = this.handleCheckboxListChange.bind(this);
        this.handleGrantAdminRole = this.handleGrantAdminRole.bind(this);
    }

    state = {
        // Selected group_id in dropdown
        group_id_dropdown: -1,
        // Name of the selected group_id in dropdown
        groupTitle_dropdown: 'Please select a group',
        groups_list: [{group_id: -1, title: "Please select a group"}],
        // Users list of the selected group
        group_users_list: [],
    }


    static propTypes = {
        name: PropTypes.string,
        orange: PropTypes.bool,
        wide: PropTypes.bool,
        clickHandler: PropTypes.func,
    };

    // Granting the user admin role in DB
    async makeUserAdmin(user_name, group_id) {
        let axios = require('axios');
        let data = {
            data: {
                type: "admin",
                attributes: {
                    user_name: user_name,
                    id: group_id
                }
            }
        }

        let config = {
            method: 'post',
            url: url_admin + '/admins',
            headers: {
                'Content-Type': 'application/json'
            },
            data : JSON.stringify(data)
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
                console.error(error);
            });

    }

    // Getting the list of users in a group
    // Used to load the user list and the creating the checkbox manu
    async getGroupUsers(group_id) {
        var axios = require('axios');
        var data = '';

        var config = {
            method: 'get',
            url: url_group_users + '/get_group_users?group_id=' + group_id,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        let r = await axios(config)
            .then(function (response) {
                console.log("getGroupUsers\nresponse from backend:");
                console.log(JSON_stringify(response.data));
                return response.data
            })
            .catch(function (error) {
                console.error(error);
            });
        return r;
    }

    // Getting the list of user that are the admins of the group
    // Used to mark the users as admins in the checkbox menu on loading the list
    async getGroupAdmins(group_id) {
        var axios = require('axios');
        var data = '';

        var config = {
            method: 'get',
            url: url_admin + '/get_group_admins?group_id=' + group_id,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        let r = await axios(config)
            .then(function (response) {
                console.log("getGroupAdmins\nresponse from backend:");
                console.log(JSON_stringify(response.data));
                return response.data
            })
            .catch(function (error) {
                console.error(error);
            });
        return r;
    }

    // Getting the list of groups that the user the admin
    // Note: only admins will see the list of groups
    async getGroupsList(user_name) {
        var axios = require('axios');
        var data = '';

        var config = {
            method: 'get',
            url: url_admin + '/get_user_admin_groups?user_name=' + user_name,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        let r = await axios(config)
            .then(function (response) {
                console.log("getGroupsList\nresponse from backend:");
                console.log(JSON_stringify(response.data));
                let tmp_arr = [{group_id: -1, title: "Please select a group"}];
                response.data.forEach(function (itr) {
                    tmp_arr.push({group_id: itr.id, title: itr.name})
                });
                return tmp_arr;
            })
            .catch(function (error) {
                console.error(error);
                return [{group_id: -1, title: "Please select a group"}];
            });
        return r;
    }

    // Updating the list of users and admins
    // Used to create the list which generating the checkbox menu
    updateGroupUsersList = async function () {
        let group_users_names = await this.getGroupUsers(this.state.group_id_dropdown);
        let group_admins = await this.getGroupAdmins(this.state.group_id_dropdown);
        let group_users = group_users_names.map(T => {
            let isChecked = false
            if (group_admins.find(element => element === T)) {
                isChecked = true
            }
            return ({
                user_name: T,
                isChecked: isChecked
            })
        })
        console.log("updateGroupUsersList:");
        console.log("group_users: " + JSON_stringify(group_users));

        return {
            group_users_list: group_users
        }
    }

    // Fetching the data and updating the sate after submitting the group selected in dropdown menu
    handleSubmitGroupId = async () => {
        // Check if the user is logged in
        if ( !this.user_logged ) {
            alert("Please Login or register")
            return
        }
        // Fetch the groups list of the user
        let groups_list = await this.getGroupsList(this.user_logged)

        console.log("handleSubmitGroupId:")
        console.log("this.state.group_id_dropdown: " + this.state.group_id_dropdown)
        console.log(JSON_stringify(groups_list))

        let group_selected_temp = groups_list.length === 0 ? '' : groups_list[0]
        this.setState({
            groups_list: groups_list,
            groupTitle_dropdown: group_selected_temp
        })
        this.setState(await this.updateGroupUsersList())
        console.log("this.state.group_users_list: " + JSON_stringify(this.state.group_users_list))

    }

    // Sending the users checked in the checkbox to backend
    // Check users are the admins of the group
    // Note: admin will be the admin forever. You can only add admins
    handleGrantAdminRole() {
        console.log("handleGrantAdminRole:")
        console.log(JSON_stringify(this.state.group_users_list))
        console.log("ELEMENTS:")
        this.state.group_users_list.filter( (item) => item.isChecked === true).forEach( (T) => {
            this.makeUserAdmin(T.user_name, this.state.group_id_dropdown)
        })
    }

    // Creating the dropdown menu of the groups
    createSelectGroup() {
        let items = [];
        this.state.groups_list.forEach((T) => {
            items.push(<option key={T.group_id} value={T.group_id}>{T.title}</option>);
        })
        return items;
    }

    // Creating the checkbox list of users
    createSelectUser() {
        console.log("createSelectUser:")
        let items = [];
        this.state.group_users_list.forEach((T) => {
            items.push(
                <div key={T.user_name + "user_list"}>
                    <label>
                        <input type="checkbox" key={T.user_name} defaultChecked={T.isChecked} name={T.user_name} onChange={this.handleCheckboxListChange}/>
                        {T.user_name}
                    </label>
                </div>
            );
        })
        return items;
    }

    // Handling the check/uncheck in the checkbox
    // Just updating the state. This will not send the data to DB
    handleCheckboxListChange(values) {
        console.log("handleCheckboxListChange")
        let group_users = this.state.group_users_list.map(T => {
            let isChecked;
            if (T.user_name === values.target.name) {
                isChecked = values.target.checked
                return ({
                    user_name: T.user_name,
                    isChecked: isChecked
                })
            }
            return T
        })
        console.log(JSON_stringify(group_users))
        this.setState({
            group_users_list: group_users
        })
    }

    // Handling the change of the group_id in dropdown menu
    // Will not load the group users list. Only updating the state
    handleChangeGroupId = async (event) => {
        console.log("group_dropdown:", event.target.value);
        let temp = this.state.groups_list.find(function (T) {
            if (T.group_id == event.target.value)
                return T;
        });
        console.log("temp.title:", temp.title);
        console.log("temp.group_id:", temp.group_id);
        this.setState({
            group_id_dropdown: temp.group_id,
            groupTitle_dropdown: temp.title,
        });
    }

    render() {
        const className = [
            "component-group-admin"
        ];
        return (
            <div className={className}>
                <div>
                    <div>
                        <label>
                            <select onChange={this.handleChangeGroupId}>
                                {this.createSelectGroup()}
                            </select>
                        </label>
                        <button type="button" onClick={this.handleSubmitGroupId}>
                            Select
                        </button>
                        <div>
                            <label>
                                {this.createSelectUser()}
                                <button type="button" onClick={this.handleGrantAdminRole}>
                                    Grant admin role
                                </button>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}



