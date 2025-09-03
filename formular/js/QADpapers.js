class QADpapers {
    constructor() {
        this.workerGenerateQAD = new Worker('/main/formular/utils/js/worker/workerGenerateQAD.js', {type:'module'})

        this.initialize();
    }


    async initialize() {
        this.data = JSON.parse(localStorage.getItem("qad"));
        const qadPapir = await this.generateQAD();
            
        document.querySelectorAll('.contents').forEach(item => {
            item.innerHTML += qadPapir;
        });
    }

    async addEventListeners(){
        window.addEventListener('storage', async (event) => {
            if(event.key === "qad") {
                this.data = JSON.parse(localStorage.getItem("qad"));
            }
        });
    }

    async generateQAD(){
        const data = await new Promise((resolve,reject) => {
            const postData = {'nav' : {'nav' : 'recept'}, data: this.data};
            this.workerGenerateQAD.postMessage(postData);
            this.workerGenerateQAD.onmessage = function (e) { resolve (e.data) };
            this.workerGenerateQAD.onerror   = function (error) { reject (error) };
        });
        return data;
    }

}


async function loadContent(params) {
    try {
        new QADpapers();
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadContent();
});