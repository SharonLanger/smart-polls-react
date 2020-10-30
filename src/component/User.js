import React from "react";
import PropTypes from "prop-types";
import "./Button.css";
import {properties} from "../properties";
import {JSON_stringify} from "../utils/printingUtils";

const url_users = properties.backend_url.user;

export default class User extends React.Component {
    state = {
        userNameLogin: '',
        passwordLogin: '',
        userName: '',
        password: '',
        email: '',
        last_name: '',
        first_name: '',
    }

    /**
     * Register user to backend
     *
     * @param {string} user_name
     * @param {string} password
     * @param {string} email
     * @param {string} first_name
     * @param {string} last_name
     */
    async postUserData(user_name, password, email, first_name, last_name){
        let axios = require('axios');
        if (user_name === "" || password === "") {
            alert("user name and password are mandatory")
            return
        }
        const params =
            "user_name=" + user_name +
            "&password=" + password +
            "&email=" + email +
            "&last_name=" + last_name +
            "&first_name=" + first_name;

        let config = {
            method: 'post',
            url: url_users + '/insert_user?' + params,
            headers: {
                'Content-Type': 'application/json'
            },
            data: ''
        };

        axios(config)
            .then(function (response) {
                console.log(JSON_stringify(response.data));
                return true
            })
            .catch(function (error) {
                console.error(error);
                alert("Can't register user. Please change user name or password")
                return false
            });
    }

    /**
     * Login user.
     *
     * @param {string} userName
     * @param {string} password
     */
    async postUserLogin(userName, password){
        var axios = require('axios');
        var data = JSON_stringify({"data":{"type":"user",
                "attributes":{
                    "user_name": userName,
                    "password": password,
                }}});

        var config = {
            method: 'get',
            url: url_users + '/login_user?user_name=' + userName + '&password=' + password,
            headers: {
                'Content-Type': 'application/json'
            },
            data : data
        };

        let r = await axios(config)
            .then(function (response) {
                console.log("postUserLogin:");
                console.log(JSON_stringify(response.data));
                return response.data
            })
            .catch(function (error) {
                console.error(error);
            });
        return r;
    }

    static propTypes = {
        name: PropTypes.string,
        wide: PropTypes.bool,
        orange: PropTypes.bool,
        clickHandler: PropTypes.func,
    };

    updateUserValues = function () {
        // Updating user data
        // To be used by setState
        return {
            userNameLogin: document.getElementById('userNameLogin').value,
            passwordLogin: document.getElementById('passwordLogin').value,
            userName: document.getElementById('userName').value,
            password: document.getElementById('password').value,
            email: document.getElementById('email').value,
            last_name: document.getElementById('last_name').value,
            first_name: document.getElementById('first_name').value,
        }
    }

    handleSubmitUser = () => {
        console.log("handleSubmitUser:")
        console.log("User:" + this.state.userName)
        console.log("Email:" + this.state.email)
        console.log("Password:" + this.state.password)
        const register_status = this.postUserData(
            this.state.userName,
            this.state.password,
            this.state.email,
            this.state.first_name,
            this.state.last_name,
        )
        // If registration fails don't login and return
        if ( !register_status ) {
            return
        }
        // Updating user data from register input form and send to backend
        this.setState(this.updateUserValues())
        alert("Hello "+ this.state.first_name + " " + this.state.last_name + ", and welcome to smart polling" )
        properties.user.user_name = this.state.userName

    }

    handleLoginUser = async () => {
        // Updating user data from login input form and send to backend
        this.setState(this.updateUserValues())

        console.log("handleLoginUser:")
        console.log("User:" + this.state.userNameLogin)
        console.log("Password:" + this.state.passwordLogin)
        let res = await this.postUserLogin(this.state.userNameLogin, this.state.passwordLogin)
        if (!res) {
            alert("Can't login\nUser name or password is wrong")
            return
        }
        this.setState({
            first_name: res.first_name,
            last_name: res.last_name,
        })
        console.log("First name: " + this.state.first_name)
        console.log("Last name: " + this.state.first_name)
        alert("Welcome back " + this.state.first_name + " " + this.state.last_name)
        properties.user.user_name = this.state.userNameLogin
    }

    handleChange = () =>  {
        // Updating state vars on change in form
        this.setState(this.updateUserValues())
    }

    render() {
        const className = {
            login: "component-user-login",
            register: "component-user-register",
        };

        return (
            <div>
                <div>
                    <form className={className.login}>
                        Login:
                        <div>
                            <div>
                                <label>
                                    <input type="text"
                                           placeholder="User name"
                                           onChange={this.handleChange}
                                           id="userNameLogin"
                                           name="userNameLogin"/>
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="text"
                                        placeholder="Password"
                                        onChange={this.handleChange}
                                        id="passwordLogin"
                                        name="passwordLogin" />
                                </label>
                            </div>
                            <div>
                                <button type="button" onClick={this.handleLoginUser} className="component-user">Login</button>
                            </div>
                        </div>
                    </form>
                </div>
                <div>
                    <form className={className.register}>
                        Register:
                        <div>
                            <div>
                                <label>
                                    <input type="text"
                                           placeholder="User name"
                                           onChange={this.handleChange}
                                           id="userName"
                                           name="userName"/>
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="text"
                                        placeholder="first_name"
                                        onChange={this.handleChange}
                                        id="first_name"
                                        name="first_name" />
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="text"
                                        placeholder="last_name"
                                        onChange={this.handleChange}
                                        id="last_name"
                                        name="last_name" />
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="text"
                                        placeholder="Email"
                                        onChange={this.handleChange}
                                        id="email"
                                        name="email" />
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="text"
                                        placeholder="Password"
                                        onChange={this.handleChange}
                                        id="password"
                                        name="password" />
                                </label>
                            </div>
                            <div>
                                <button type="button" onClick={this.handleSubmitUser} className="component-user">Submit</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
