import init, { fill_docx_multi } from './library/docx_filler_js/docx_filler.js';

class selectGyartasAndFormular {
    constructor() {
        this.workerGenerateIndex = new Worker('https://cdn.jsdelivr.net/gh/BenGeep/minit@main/formular/js/worker/workerGenerateIndex.js', {type:'module'})
        this.workerGetData  = new Worker('/main/sic/js/worker/workerGetData.js', {type:'module'});
        
        this.datumVonal = new Map([
            ['datum', ''], 
            ['vonal','']
        ]);
        
        this.initialize();
    }

    async initialize(){    
        await init();
                
        let data = {};
        const showAlertDatumVonal = () => {
            if(this.datumVonal.get('datum') === '' || this.datumVonal.get('vonal') === ''){
                alert('Dátum és Vonal választása!');
                return false;
            }else{
                return true;
            }
        }
        const showAlertDatumSarza = (data) => {
            if(['Szavidő', 'Sarza'].includes(data)){
                alert(`Hiányzó: ${data}!`);
                return false;
            }else{
                return true;
            }                
        }
        const contents = document.querySelectorAll('.contents');
        const indexTable  = await this.generateIndex();        
        contents.forEach(content => content.innerHTML += indexTable.html)
        
        document.querySelector("body").addEventListener('click', async (event) => {
            const { target } = event;

            switch (target.name) {
                case "qad":
                    if (!showAlertDatumVonal()){ break; }
                    data = {
                        termek_artikel : target.getAttribute("termek_artikel"),
                        termek_nev : target.getAttribute("termek_nev"),
                        id_pp : target.getAttribute("id_pp"),
                        
                        id_pp_sub : target.getAttribute("id_pp_sub"),
                        artikel_sub : target.getAttribute("artikel_sub"),
                        adag : target.getAttribute("adag"),
                        nev_sub : target.getAttribute("nev_sub"),
                        vonal : this.datumVonal.get("vonal"), 
                        datum : this.datumVonal.get("datum"),
                    }
                    localStorage.setItem("qad", JSON.stringify(data));
                    window.open("qad.html", "qad");
                    break;
                case "SIC":
                    if (!showAlertDatumVonal()){ break; }
                    data  = await this.getSICData();
                    const mapData = data.mapData

                    let id_pp = target.getAttribute("id_pp");
                    await this.getValues(mapData.get(id_pp));
                    break;
                case "csomagolo":               
                    if (!showAlertDatumVonal()){ break; }
                    
                    const datum = this.datumVonal.get("datum");
                    const dmt = target.getAttribute("dmt").split('-').reverse().join('-') || 'Szavidő';
                    const sarza = target.getAttribute("sarza") || 'Sarza';
                    const karton = target.getAttribute("karton") || '';
                    const tipus  = target.getAttribute("tipus") || 'sima';

                    if (!showAlertDatumSarza(sarza) || !showAlertDatumSarza(dmt)) { break; }

                    const artikel = target.getAttribute("artikel");
                    const name = target.getAttribute("nev");
                    const id__pp = target.getAttribute("id_pp");
                    const docName = `${artikel}_${name}_${datum}_${id__pp}_Csomagolo_Naplo`
                    //F-1.2_C_Dennik_balicov_MINIT_HOME_27062024
                    //F-1.23_B_Dennik_balicov_automaticka_linka_27062024
                    if(tipus === 'sima'){
                        data = {
                            url : 'utils/formular/F-1.23_B_Dennik_balicov_automaticka_linka_27062024.docx',
                            placeholders : ["#D", "#T", "#S", "#A", "#N", '#K'],
                            values : [datum, dmt, sarza, artikel, name, karton],
                            text : 'Letöltés!',
                        }
                    }else{
                        data = {
                            url : 'utils/formular/F-1.2_C_Dennik_balicov_MINIT_HOME_27062024.docx',
                            placeholders : ["#D", "#T", "#S", "#A", "#N"],
                            values : [datum, datum, sarza, artikel, name],
                            text : 'Letöltés!',
                        }
                    }
                    
                    
                    this.fillFromServer(data, target, docName);

                    break;
                default:
                    break;
            }
        });

        const setCsomagoloNaploData = (target, name, attribute) => {
            target.parentElement.parentElement.querySelector(`[name="${name}"]`).setAttribute(attribute,target.value);
        }

        document.querySelector("body").addEventListener('change', event => {
            const { target } = event;

            switch (target.name) {
                case "datum":
                    this.datumVonal.set('datum', target.value);
                    let sarza;
                    target.parentElement.parentElement.parentElement.querySelectorAll('[name="csomagolo-sarza"]').forEach(item => {
                        sarza = target.value.split('-');
                        sarza = `${sarza[0].slice(2,4)}${sarza[1]}${sarza[2]}`;
                        item.value = sarza;
                    });
                    target.parentElement.parentElement.parentElement.querySelectorAll('[name="csomagolo"]').forEach(item => {
                        item.setAttribute("sarza", sarza);
                    });
                    break;
                case "vonal":
                    this.datumVonal.set('vonal', target.value);
                    break;
                case "csomagolo-datum":
                    setCsomagoloNaploData(target, "csomagolo", "dmt");
                    break;
                case "csomagolo-sarza":
                    setCsomagoloNaploData(target, "csomagolo", "sarza");
                    break;
                case "karton":
                    setCsomagoloNaploData(target, "csomagolo", "karton");
                default:
                    break;
            }            
            //console.log(target.parentElement.parentElement.querySelector('[name="csomagolo"]'))
        });
    }



    async fillFromServer(data, target, docName) {
        const { url, placeholders, values, text } = data;
       
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch file from server');
            const arrayBuffer = await response.arrayBuffer();

            const filledBytes = fill_docx_multi(
                new Uint8Array(arrayBuffer),
                placeholders,
                values
            );

            const blob = new Blob([filledBytes], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });

            const downloadUrl = URL.createObjectURL(blob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = `${docName}.docx`;
            downloadLink.style.display = 'inline';
            downloadLink.textContent = text;
            target.replaceWith(downloadLink);
        } catch (e) {
            alert('Error: ' + e.message);
        }
    }

    async generateIndex(){
        const data = await new Promise((resolve,reject) => {
            const postData = {'nav' : 'gyartas'};
            this.workerGenerateIndex.postMessage(postData);
            this.workerGenerateIndex.onmessage = function (e) { resolve (e.data) };
            this.workerGenerateIndex.onerror   = function (error) { reject (error) };
        });
        return data;
    }

    async getSICData(){
        const data = await new Promise((resolve,reject) => {
            const postData = 'none';
            this.workerGetData.postMessage(postData);
            this.workerGetData.onmessage = function (e) { resolve (e.data) };
            this.workerGetData.onerror   = function (error) { reject (error) };
        });
        return data;
    }

    async getValues(data){
        let saveData = { data : data, datum : this.datumVonal.get("datum"), vonal : this.datumVonal.get("vonal") }
        localStorage.setItem('pp_id', JSON.stringify(saveData));
        window.open('sic.html','sic');
    }
}

async function loadContent(params) {
    try {
        new selectGyartasAndFormular();
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadContent();
});