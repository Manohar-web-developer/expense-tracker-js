const addTransactionBtn = document.getElementById("addTransactionBtn");
const submitBtn = document.getElementById("submitBtn");
let Allin = document.querySelectorAll(".form-group");

let allTransaction = [];

let validate = () => {
    let isValid = true;

    Allin.forEach((v) => {
        let filled = v.querySelector("input") || v.querySelector("select");

        let filledValue = filled.value;

        if (filledValue === '') {
            v.querySelector(".error-msg").classList.add("block")
            isValid = false;
        } else {
            v.querySelector(".error-msg").classList.remove("block")
        }


    })

    return isValid;

}

Allin.forEach((v) => {
    let filled = v.querySelector("input") || v.querySelector("select");

    let eventType = filled.tagName === "SELECT" ? "change" : "input";
    filled.addEventListener(eventType, () => { validate() })
})
addTransactionBtn.addEventListener("click", () => {
    document.getElementById("txTitle").focus();
})


let createTransaction = () => {
    let Transaction = {
        id: Date.now(),
        Date: new Date(),
        txTitle: document.querySelector("#txTitle").value,
        txAmount: document.querySelector("#txAmount").value,
        txType: document.querySelector("#txType").value,
        txCategory: document.querySelector("#txCategory").value,
    }
    allTransaction.push(Transaction);
}



let renderTable = (data = allTransaction) => {
    let tbody = document.getElementById("txTableBody");
    let emptyState = document.getElementById("emptyState");

    tbody.innerHTML = "";

    if (data.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    data.forEach((t) => {
        let tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <div class="title-cell">
                    <div class="tx-icon ${t.txCategory.toLowerCase()}">
                        <i class="fa-solid fa-briefcase"></i>
                    </div>
                    <div>
                        <div class="tx-name">${t.txTitle}</div>
                    </div>
                </div>
            </td>
            <td><span class="badge ${t.txCategory.toLowerCase()}">${t.txCategory}</span></td>
            <td>
                <span class="${t.txType === 'Income' ? 'type-income' : 'type-expense'}">
                    <span class="type-arrow ${t.txType === 'Income' ? 'income-arrow' : 'expense-arrow'}">
                        <i class="fa-solid ${t.txType === 'Income' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
                    </span>
                    ${t.txType}
                </span>
            </td>
            <td class="${t.txType === 'Income' ? 'amt-income' : 'amt-expense'}">
                ₹${parseFloat(t.txAmount).toFixed(2)}
            </td>
            <td class="date-cell">
                ${t.Date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                <br/>
                ${t.Date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </td>
            <td>
                <button class="del-btn" data-id="${t.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

let updateStats = () => {
    let income = allTransaction.filter(t => t.txType === "Income").reduce((total, t) => {
        return total + Number(t.txAmount)
    }, 0);



    let expense = allTransaction.filter(t => t.txType === "Expense").reduce((total, t) => {
        return total + Number(t.txAmount)
    }, 0);


    document.getElementById("totalIncome").innerText = "₹" + income.toFixed(2)
    document.getElementById("totalExpense").innerText = "₹" + expense.toFixed(2)
    document.getElementById("totalBalance").innerText = "₹" + ( income - expense).toFixed(2)
    document.getElementById("txCount").innerText = allTransaction.length
}

let saveToStorage = () => {
    localStorage.setItem("transactions", JSON.stringify(allTransaction))
}
let loadFromStorage = () => {
    let data = localStorage.getItem("transactions");
    if (data) {
        allTransaction = JSON.parse(data);
        allTransaction.forEach(t => t.Date = new Date(t.Date));
        renderTable();
        updateStats();
    }
}

let tbody = document.getElementById("txTableBody");


tbody.addEventListener("click", (e) => {
   let btn = e.target.closest(".del-btn");
    if(btn){
        let id = btn.dataset.id

        allTransaction = allTransaction.filter(t => t.id !== Number(id));

        saveToStorage();
        renderTable();
        updateStats();
    }
})

let filterTab = document.querySelectorAll(".filter-tabs .tab");

filterTab.forEach((v, i) => {
    // console.log(v);
    v.addEventListener("click", () => {

        filterTab.forEach( tab => {
            tab.classList.remove("active-all")
        })
        v.classList.add("active-all")
        let filtered = [];
        if(v.innerText.trim() === "Income") {
            filtered = allTransaction.filter(i => i.txType === "Income")
        } else if(v.innerText.trim() === "Expense") {
            filtered = allTransaction.filter(i => i.txType === "Expense")
        } else {
            filtered = allTransaction  
        }
        renderTable(filtered);
    })
   
    
})

let categoryFilter = document.getElementById("categoryFilter");

categoryFilter.addEventListener("change", () => {
    let selected = categoryFilter.value;
    
    let filtered = allTransaction.filter(t => {
        if(selected === "") return true;
        return t.txCategory === selected;
    });
    
    renderTable(filtered);
});

flatpickr(".icon-btn", {
    mode: "range",
    dateFormat: "Y-m-d",
    onClose: function(selectedDates) {
        if(selectedDates.length === 0) return;
        
        let start = selectedDates[0];
        let end = selectedDates[1] || selectedDates[0];

        end.setHours(23, 59, 59); 

        let filtered = allTransaction.filter(t => {
            return t.Date >= start && t.Date <= end;
        });

        renderTable(filtered);
    }
});
submitBtn.addEventListener("click", () => {
    if (validate()) {
        createTransaction();
        saveToStorage();
        Allin.forEach(v => {
            let filled = v.querySelector("input") || v.querySelector("select");
            if (filled.tagName === "SELECT") {
                filled.selectedIndex = 0;
            } else {
                filled.value = "";
            }
        });
        renderTable();
        updateStats();
    }
});
loadFromStorage();