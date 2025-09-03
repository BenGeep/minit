import init, { generate_qr_svg } from '../library/qr_generator_js/qr_generator_js/qr_generator.js';

async function initWasm() {
    await init();
}
initWasm();

self.onmessage = async function(e) {
    const { nav, data } = e.data;
    const response = await fetchServer(nav);
    const QADTableHTML = await generateQADTableHTML(response.recept, data);
    self.postMessage(QADTableHTML);

}

async function generateQADTableHTML(recept, data) {
    console.log(data)
    let selectedRecept = new Map();
    recept.forEach(item => {
        if (item['0'] === data.artikel_sub) {
            selectedRecept.set(item['1'], item)
        }
    });
    let qrCode = generate_qr_svg(`w${data.id_pp_sub}`,8);
    let qadPapir = ''
    selectedRecept.keys().forEach(item => {
        let anyag = selectedRecept.get(item);
        console.log(anyag['2'])
        if(anyag.nev !== null && anyag['2'] !== 0) {
            qadPapir += `
            <tr>
                <td><strong>${anyag.nev}</strong></td>
                <td><strong>${anyag['1']}</strong></td>
                <td><strong>${data.adag}</strong></td>
                <td><strong>${anyag['2']}</strong></td>
            </tr>`;
        } 
    });

    let html = `
    <div class="form-container">
        <div class="form-header">Munkalap</div>

        <div class="info-line">Datum: ${data.datum}</div>
        <div class="info-line">Vonal: ${data.vonal}</div>

        <div class="section">
        <strong>Gyártott termék</strong>
        <div>ID: ${data.id_pp}</div>
        <div>Artikel: ${data.termek_artikel}</div>
        <div>Termék: ${data.termek_nev}</div>
        </div>

        <div class="section">
        <strong>Hozzárendelt Munkalap</strong>
        <div>ID: ${data.id_pp_sub}</div>
        <div>Artikel: ${data.artikel_sub}</div>
        <div>Munkalap: ${data.nev_sub}</div>
        </div>

        <table>
        <thead>
            <tr>
            <th>Alapanyag Név</th>
            <th>Alapanyag Artikel</th>
            <th>Tervezett Mennyiség</th>
            <th>Recept Mennyiség</th>
            </tr>
        </thead>
        <tbody>${qadPapir}</tbody>
        </table>

        <div class="qr-code-container">${qrCode}</div>
    </div>
    `;
    /*const recept = data.map(item => {
        if(item['0'] === artikel && item['nev'] !== null) {
            return `<tr>
                <td>${item.nev}</td>
            </tr>`;
        }
    })
    html += recept.join('');
    html += '</tbody><table>';
    html += qrCode;
    */
    return html;
}


async function fetchServer(e) {

    let result = [];
    const url = 'https://morningreport.minit.local:8080/main/formular/utils/php/requestManager.php';
    
    try {
        const response = await fetch(url, {
            method  : 'POST',
            mode    : 'no-cors',
            headers : { 'Content-Type' : 'application/json'},
            body    : JSON.stringify(e)
        });
        result = await response.json();
        
    } catch (error) {
        console.error(error)
    };

    return result;

}