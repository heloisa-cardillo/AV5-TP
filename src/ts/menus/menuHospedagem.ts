import Menu from "../interfaces/menu";

export default class MenuHospedagem implements Menu {
    mostrar(): void {
        console.log('****************************')
        console.log('| 🥕🐇 Villa dos Coelhos - Hospedagem')
        console.log('----------------------')
        console.log('| 1 - Listar acomodacoes')
        console.log('| 2 - Registrar hospedagem')
        console.log('| 3 - Listar hospedagens')
        console.log('----------------------')
        console.log('| 0 - Voltar')
        console.log('----------------------')
    }
}