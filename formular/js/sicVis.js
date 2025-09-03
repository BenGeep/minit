class SIC{
    constructor(){
        this.initialize();
    }

    
    async initialize() {
        await this.evaluateAtStart();
    }

    async evaluateAtStart(){
        this.readData = JSON.parse(localStorage.getItem('pp_id'));
        this.data = this.readData['data']
        const artikel = this.data[0].artikel_pp;
        const nev = this.data[0].nev;
        const tervezett = parseInt(this.data[0].order_pp)?.toLocaleString();
        let tervDag = '';
        
        const alapanyag = this.data.map(item => {
            if(item.komponens.slice(0,2) === '22') tervDag = item.order_adag;

            const kgadag = item.komponens.slice(0,1) === '2'
            ? 'adag'
            : 'kg';
            const order_adag = `<td>${(Math.round(item.order_adag * 10) / 10).toLocaleString()} ${kgadag}</td>`;
            const for_dag = `<td>${(Math.round(item.for_dag *100 ) / 100).toLocaleString()} ${kgadag}</td>`
           return `<tr class="szukseges-alapanyag">
            <td>${item.komponens}</td>
            <td>${item.nev_komp}</td>${order_adag}${for_dag}
            <td></td>
            <td></td>
            </tr>`;
        })
        
        let selejt = `
            <tr>
                <td rowspan="2">Termék</td>
                <td>Üzemi</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>

                <td colspan="4"></td>
            </tr>
            <tr>
                <td style="display: none;">Termék</td>
                <td>Műszaki</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>

                <td colspan="4"></td>
            </tr>`
        const selejtRows = this.data.map(item => {
           return `<tr>
            <td>${item.komponens}</td>
            <td>${item.nev_komp}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td colspan="4"></td>
            </tr>`;
        }).join('')
        
        selejt += selejtRows;
        

        const orak = new Array(12).fill(`
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>`
        );

        const oraiJelentes = orak.map(item => {
            return `<tr class="jelentes-2-sor">${item}</tr>`
        })
            
  
        document.querySelector('#artikel').textContent = artikel;
        document.querySelector('#termek-nev').textContent = nev;
        document.querySelector('#tervezett-mennyiseg').textContent = tervezett;
        document.querySelector('#tervezett-dagasztas').textContent = Math.round(tervDag);

        document.querySelector('#alapanyag').innerHTML += alapanyag.join('');
        document.querySelectorAll('.selejt').forEach(item => item.children[1].innerHTML = selejt);
        document.querySelector('#orai-jelentes').innerHTML = oraiJelentes.join('');

        document.querySelector('#datum').value = this.readData.datum;
        document.querySelector('#vonal').value = this.readData.vonal;
    }

}

async function loadContent() {
    try {
        new SIC();
    } catch (error) {
        console.error(error)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadContent();
})