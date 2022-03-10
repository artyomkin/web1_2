document.addEventListener("DOMContentLoaded", function() {
    let form = document.getElementById("coordinates_form");
    form.addEventListener("submit", formSend);
    
    let resultArr = new Array();
    let lastResultIndex = 0;
    
    const MAX_RESULTS_IN_TABLE = 3;
    
    async function formSend(form_event) {
        form_event.preventDefault();
        
        let btn = document.getElementById("submit_request");
        btn.setAttribute("disabled","disabled")
              
        let formReq = document.getElementsByClassName("required");
        
        for(let i = 0; i < formReq.length; i++) {
            
            let inputField = formReq[i];
            inputField.classList.remove("error");

            let siblings = inputField.parentElement.childNodes;

            for (let j = 0; j < siblings.length; j++) {
                if(siblings[j].className === "error_message") {
                    siblings[j].innerHTML = "";

                }
            }
        }
        let error = await formValidate();
                  
        if(!error) {
            let x_radios = document.querySelectorAll(".x");
            let x;
            for (let i = 0; i < x_radios.length; i++){
                console.log(x_radios[i].value);
                console.log(x_radios[i].checked);
                if (x_radios[i].checked){
                    x = Number(x_radios[i].value);
                }
            }
            let y = document.getElementById("y").value;
            let R = document.getElementById("R").value;

            const request = new XMLHttpRequest();
            const url = "handler.php?x=" + x + "&y=" + y + "&R=" + R;
            
            request.open("GET", url);
            request.setRequestHeader("Content-Type","application/x-www-form-url");
            request.addEventListener("readystatechange", ()=> {
                if(request.readyState === 4 && request.status === 200) {
                    console.log(request.response);
                    let response = JSON.parse(request.response);

                    addResult(response.x,response.y,response.R,response.hit);
                    updateTime(response.current_time, response.working_time);

                }
            })
            request.send();

        }
        btn.removeAttribute("disabled");

    }
    
    async function formValidate() {
        let formReq = document.getElementsByClassName("required");
        let isEmpty = false;
        let isNumber = true;
        let isPositive = true;
        
        for (let i = 0; i<formReq.length; i++) {
            let inputField = formReq[i];
            let siblings = inputField.parentElement.childNodes;
            
            if(inputField.value.trim() === "") {
                isEmpty = true;
                setError(inputField, siblings, "Поле не должно быть пустым");
                
            } else if (isNaN(inputField.value)) {
                isNumber = false;
                setError(inputField, siblings, "В поле должно быть число");
                
            } else if (inputField.value < 0 && inputField.id === "R") {
                isPositive = false;
                setError(inputField, siblings, "Значение не может быть отрицательным")
                
            }
        }
        return !(!isEmpty && isNumber && isPositive);

    }
    
    async function setError(inputField, siblings, error_message) {
        inputField.classList.add("error")
                
        for (let j = 0; j<siblings.length; j++) {
            if (siblings[j].className === "error_message") {
                siblings[j].innerHTML = error_message;

            }
        }
    }
    
    async function addResult(x, y, R, hit) {
        let results = document.getElementById("results");
        
        resultArr.push(new Result(x, y, R, hit));
        lastResultIndex++;

        if(lastResultIndex < MAX_RESULTS_IN_TABLE) {
            results.appendChild(createResultRow(x, y, R, hit));

        } else {
            if(lastResultIndex === resultArr.length - 1){
                results.removeChild(results.firstChild);
                results.appendChild(createResultRow(x,y,R,hit));
                
            } else {
                while(results.firstChild){
                    results.removeChild(results.firstChild);

                }

                let firstRes = resultArr[resultArr.length - 2];
                results.appendChild(createResultRow(firstRes.x, firstRes.y, firstRes.R, firstRes.hit))

                let secondRes = resultArr[resultArr.length - 1];
                results.appendChild(createResultRow(secondRes.x, secondRes.y, secondRes.R, secondRes.hit));

                results.appendChild(createResultRow(x, y, R, hit));

                lastResultIndex = resultArr.length - 1;

            }
        }
        updateDotsInChart();
        checkOverflow(results);

    }
    
    function createResultRow(x, y, R, hit){
        let row = document.createElement("tr");

        let firstCell = document.createElement("td");
        firstCell.classList.add("left");
        firstCell.innerHTML = x;
        
        let secondCell = document.createElement("td");
        secondCell.innerHTML = y;
        
        let thirdCell = document.createElement("td");
        thirdCell.innerHTML = R;
        
        let fourthCell = document.createElement("td");
        fourthCell.classList.add("right");
        fourthCell.innerHTML = hit;
        
        row.appendChild(firstCell);
        row.appendChild(secondCell);
        row.appendChild(thirdCell);
        row.appendChild(fourthCell);
        
        return row;

    }
    
    async function checkOverflow(results) {
        if(resultArr.length > MAX_RESULTS_IN_TABLE) {
            
            let prev_btn = document.getElementById("pag_prev");
            let next_btn = document.getElementById("pag_next");
            
            prev_btn.classList.remove("hidden");
            next_btn.classList.remove("hidden");
            
            prev_btn.addEventListener("click", pagPrev);
            next_btn.addEventListener("click", pagNext);

        }
    }
    
    async function pagPrev() {
        let results = document.getElementById("results");
        if(resultArr.length > MAX_RESULTS_IN_TABLE && lastResultIndex >= MAX_RESULTS_IN_TABLE) {
            
            results.removeChild(results.lastChild);
            
            let prevResult = resultArr[lastResultIndex - MAX_RESULTS_IN_TABLE];
            
            results.prepend(createResultRow(
                prevResult.x,
                prevResult.y,
                prevResult.R,
                prevResult.hit
            ));
            lastResultIndex--;

        }
    }
    
    async function pagNext() {
        let results = document.getElementById("results");
        
        if(resultArr.length > MAX_RESULTS_IN_TABLE && lastResultIndex < resultArr.length - 1) {
            results.removeChild(results.firstChild);
            
            let nextResult = resultArr[lastResultIndex + 1];
            
            results.append(createResultRow(
                nextResult.x,
                nextResult.y,
                nextResult.R,
                nextResult.hit
            ));
            lastResultIndex++;

        }
    }
    
    async function updateTime(current_time, working_time) {
        let header_wrapper = document.querySelector(".header_wrapper");
        let hiddens = header_wrapper.querySelectorAll(".hidden");
        
        for (let i = 0; i < hiddens.length; i++) {
            hiddens[i].classList.remove("hidden");
            
        }

        document.getElementById("current_time").innerHTML = current_time;
        document.getElementById("working_time").innerHTML = working_time;

    }
    
    async function updateDotsInChart() {
        let dotsDiv = document.getElementById("dots");
        
        while(dotsDiv.firstChild) {
            dotsDiv.removeChild(dotsDiv.firstChild);
        }

        let result = resultArr[resultArr.length - 1];
        
        let x = Number(result.x);
        let y = Number(result.y);
        let R = Number(result.R);

        let xPercentage = calculatePercentage(x, R);
        let yPercentage = calculatePercentage(-y, R);

        if(R <= 0 && x === 0 && y === 0) {
            xPercentage = 50;
            yPercentage = 50;

        }
        
        let dot = document.createElement("div")
        dot.classList.add("dot");
        
        if(Boolean(result.hit)){
            dot.classList.add("green_dot");

        } else {
            dot.classList.add("red_dot");

        }

        let style =
            "margin-left: " + String(xPercentage) + "%;" +
            "margin-top: " + String(yPercentage) + "%;";
        
        dot.setAttribute("style", style);
        dotsDiv.appendChild(dot);

    }
    
    function calculatePercentage(n, R) {
        let percentage = 50 + n/R * 100 * 0.5;
        
        if(percentage > 100) {
            percentage = 100;
        } else if (percentage < 0) {
            percentage = -5;
        }
        
        return percentage;

    }
})