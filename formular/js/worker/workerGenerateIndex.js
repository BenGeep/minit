self.onmessage = async function(e) {
    const fetchArray = [fetchServer({ nav : e.data }), fetchServer({ nav : {nav : 'recept'}})];
    
    const respData = await Promise.all(fetchArray);
    
    const gyartasTable = await generateGyartasHTML({respData : respData});
    self.postMessage(gyartasTable);
}

async function generateGyartasHTML({respData = {}} = {}){
    const { gyartas } = respData[0];
    const { recept } = respData[1];
    
    const id = [... new Set(gyartas.map(item => item.id_pp))];
    const mapGyartas = new Map();
    let html = '';

    gyartas.forEach(item => {
        const key = item.id_pp;
        if(!mapGyartas.has(key)){
            mapGyartas.set(key, [])
        }
        mapGyartas.get(key).push(item);
    });

    const mapTermek = new Map(gyartas.map(item => [item.id_pp, item
    ]));

    const levetiCikkszamFun = (recept, termekArray) => recept
    .filter(item => item['1'] === termekArray.artikel_pp)
    .map(item => {
        return { artikel : item['0'], nev : item['nev_main'] }
    })
    .filter(item => item['nev'] !== null)
    .map(item => {
        let minitHome = item['nev'].includes('HOME') || item['nev'].includes('MH') ? 'home' : 'sima';
        return `
        <tr>
            <td>${item['artikel']}</td>
            <td>${item['nev']}</td>
            <td><input type="number" name="csomagolo-sarza"></td>
            <td><input type="date" min="2026-02-26" name="csomagolo-datum" ></td>
            <td><input type="text" name="karton"></td>
            <td><button type="button" name="csomagolo" artikel="${item['artikel']}" nev="${item['nev']}" karton="" tipus="${minitHome}" id_pp="${termekArray.id_pp}">Nyomtat!</button></td>
        </tr>`
    }).join('');

    id.forEach(item => {
        const termek = mapGyartas.get(item);
        if(termek.length > 1){
            let termekArray = mapTermek.get(item);
            const levetiCikkszam = levetiCikkszamFun(recept, termekArray);

            html += `
            <div class="gyartasok">`;
            html += `
            <table>
                <thead>
                    <tr>
                        <th class="pp" id_pp="${termekArray.id_pp}" >${termekArray.artikel_pp}</th>
                        <th colspan="5" class="pp" id_pp="${termekArray.id_pp}" >${termekArray.nev}</th>
                    </tr>
                </thead>
                <tbody>`;     
            html += `
                    <tr>
                        <th colspan="3" >Dátum</th>
                        <th colspan="3" >Vonal</th>
                    </tr>
                    <tr>
                        <td colspan="3" ><input name="datum" type="date"></td>
                        <td colspan="3" >
                            <select name="vonal">
                                <option value="Válassz...">Válassz...</option>
                                <option value="Automata 1">Automata 1</option>
                                <option value="Automata 2">Automata 2</option>
                                <option value="Automata 3">Automata 3</option>
                                <option value="Automata 4">Automata 4</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>SIC</strong></td>
                        <td colspan="4"></td>
                        <td style="text-align:center;" ><button type="button" id_pp="${termekArray.id_pp}" name="SIC" >Nyomtat!</button></td>
                    </tr>
                `;
            html += `
                    <tr>
                        <td>${termekArray.id_pp}</td>
                        <td>${termekArray.artikel_pp}</td>
                        <td colspan="2" >${termekArray.nev}</td>
                        <td>${parseInt(termekArray.order_pp).toLocaleString()}</td>
                        <td><button name="qad" termek_artikel="${termekArray.artikel_pp}" termek_nev="${termekArray.nev}" id_pp="${termekArray.id_pp}" id_pp_sub="${termekArray.id_pp}" artikel_sub="${termekArray.artikel_pp}" adag="${termekArray.order_adag}" nev_sub="${termekArray.nev}" >Nyomtat!</button></td>
                    </tr>
            `;
            termek.forEach(jtem => {
                const kgadag = jtem.komponens.slice(0,1) === '2'
                ? 'adag'
                : 'kg';
                const order_adag = Math.round(jtem.order_adag *10 )/10;
                const qadPapir = jtem.sub_id === '' ? '' : `<button name="qad" termek_artikel="${termekArray.artikel_pp}" termek_nev="${termekArray.nev}" id_pp="${termekArray.id_pp}" id_pp_sub="${jtem.sub_id}" artikel_sub="${jtem.komponens}" adag="${jtem.order_adag}" nev_sub="${jtem.nev_komp}" >Nyomtat!</button>`; 
                html += `<tr>`
                html += `
                    <td>${jtem.sub_id}</td>
                    <td>${jtem.komponens}</td>
                    <td colspan="2" >${jtem.nev_komp}</td>
                    <td>${order_adag.toLocaleString()} ${kgadag}</td>
                    <td>${qadPapir}</td>`;
                html += `</tr>`
            });
                html += `
                    <tr>
                        <th>Artikel</th>
                        <th>Név</th>
                        <th>Sarzsa</th>
                        <th>DMT</th>
                        <th>Karton</th>
                        <th></th>
                    </tr>
                    ${levetiCikkszam}
                </tbody>
            </table>
            </div>`;
               
        }
    });
    
    return { html };

}

async function fetchServer({ url = 'https://morningreport.minit.local:8080/main/formular/utils/php/requestManager.php', nav = '' } = {}) {
    
    let result = [];

    try {
        const response = await fetch(url, {
            method  : 'POST',
            mode: 'no-cors',
            headers : { 'Content-Type' : 'application/json'},
            body    : JSON.stringify(nav)
        });
        result = await response.json();
        
    } catch (error) {
        console.error(error)
    };

    return result;

}