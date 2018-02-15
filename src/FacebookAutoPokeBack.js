/**
 * FacebookAutoPokeBack.js
 *
 * This script is meant to be used in combination with a userscript in order to
 * correctly function. If you don't have a userscriptt plug-in installed now
 * would be a good time to look for one you like.
 *
 * Usage:
 *   Link to this file (either from the master branche, or a version tag) inside
 *   your userscript in order to use the functionality provided. There is only
 *   one configurable in this whole script; the option to not poke some people
 *   back automatically.
 *
 *   For a general idea of how I did this myself, please see `sample.user.js`.
 *
 * @author Roel Walraven <mail@cytodev.io>
 *
 * This file is licensed under The MIT License (MIT)
 *
 *   Copyright (c) 2017 Roel Walraven <mail@cytodev.io>
 *
 *   Permission  is hereby  granted, free  of  charge, to any person obtaining a
 *   copy of this software and associated documentation files  (the "Software"),
 *   to  deal in the Software without  restriction, including without limitation
 *   the  rights to use,  copy, modify,  merge, publish, distribute, sublicense,
 *   and/or  sell copies  of  the Software, and  to  permit  persons to whom the
 *   Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included  in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY  KIND, EXPRESS OR
 *   IMPLIED,  INCLUDING BUT  NOT LIMITED TO THE  WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS  OR COPYRIGHT  HOLDERS BE  LIABLE FOR ANY  CLAIM, DAMAGES OR  OTHER
 *   LIABILITY, WHETHER  IN AN  ACTION OF  CONTRACT, TORT OR OTHERWISE,  ARISING
 *   FROM, OUT  OF  OR IN CONNECTION  WITH  THE  SOFTWARE  OR THE  USE  OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 */

"use strict";

function FacebookAutoPokeBack() {
    /**
     * pokeExceptions
     *
     * @type {Array}
     */
    this.pokeExceptions = [];

    /**
     * observeDOM
     *   Creates the MutationObserver function used with the main functionality
     *   of this script.
     *
     * @param {Object}   object   [DOM node to listen to]
     * @param {Function} callback [Callback function]
     */
    this.observeDOM = function(object, callback) {
        let MutationObserver       = window.MutationObserver || window.WebKitMutationObserver;
        let eventListenerSupported = window.addEventListener;

        if(MutationObserver) {
            let observer = new MutationObserver(function(mutations) {
                if(mutations[0].addedNodes.length || mutations[0].removedNodes.length)
                    callback();
            });

            observer.observe(object, {
                childList : true,
                subtree   : true
            });
        } else if(eventListenerSupported) {
            object.addEventListener("DOMNodeInserted", callback, false);
            object.addEventListener("DOMNodeRemoved", callback, false);
        }
    };

    /**
     * notify
     *   Sends a notification.
     *
     * @param  {string} title   [Notification title]
     * @param  {string} message [Notification message]
     * @param  {string} icon    [Notification icon]
     */
    this.notify = function(title, message, icon = null) {
        if(!("Notification" in window))
            return;

        if(Notification.permission !== "denied") {
            Notification.requestPermission(function(permission) {
                if(permission === "granted")
                    new Notification(title, {
                        body: message,
                        icon: icon
                    });
            });
        }
    };

    /**
     * init
     *   Initializes the UI, sets the pokeExceptions variable, and starts the
     *   mutation observer.
     *
     * @param {array} pokeExceptions [List of people _not_ to poke back]
     */
    this.init = function(pokeExceptions) {
        let checkbox = document.createElement("input");
        let label    = document.createElement("label");

        checkbox.type    = "checkbox";
        checkbox.name    = "autopoke";
        checkbox.checked = false;

        checkbox.style.verticalAlign = "middle";
        checkbox.style.marginLeft    = "16px";

        label.htmlFor   = "autopoke";
        label.innerHTML = "Automatically poke back";

        document.getElementsByClassName("uiHeaderTitle")[3].appendChild(checkbox);
        document.getElementsByClassName("uiHeaderTitle")[3].appendChild(label);

        if(Array.isArray(pokeExceptions)) {
            this.pokeExceptions = pokeExceptions;
        } else {
            window.console.warn("pokeExceptions is not an array.");
        }

        this.observeDOM(document.getElementById("poke_live_new"), function() {
            if(!checkbox.checked)
                return;

            let pokeButton = document.getElementById("poke_live_new").children[0].querySelector("a.selected");
            let check      = document.getElementById("poke_live_new").children[0].getElementsByTagName("a")[3].innerHTML;
            let person     = document.getElementById("poke_live_new").children[0].getElementsByTagName("a")[2].innerHTML;
            let avatar     = document.getElementById("poke_live_new").children[0].getElementsByTagName("img")[0].src;

            if(pokeButton !== null) {
                window.setTimeout(function() {
                    if(pokeExceptions.indexOf(check) !== -1)
                        return window.console.log(check + " is in the array of exceptions.");

                    pokeButton.click();
                }, 1000);
            } else {
                if(!("Notification" in window))
                    return;

                if(Notification.permission !== "denied") {
                    Notification.requestPermission(function(permission) {
                        if(permission === "granted")
                            new Notification("Facebook Auto poke-back", {
                                body: "Automatically poked " + person + " back.",
                                icon: avatar
                            });
                    });
                }
            }
        });
    };
}

/* jshint node : true  */

if(typeof module !== "undefined" && module.exports)
    module.exports = FacebookAutoPokeBack;

/* jshint node : false  */
