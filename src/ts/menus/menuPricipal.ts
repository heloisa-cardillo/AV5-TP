import Menu from "../interfaces/menu";

export default class MenuPrincipal implements Menu {
    mostrar(): void {
        console.log('****************************')
        console.log('| 🐇 Villa dos Coelhos 🥕')
        console.log('| Por favor, selecione uma opcao...')
        console.log('----------------------')
        console.log('| 1 - Clientes')
        console.log('| 2 - Hospedagem')
        console.log('----------------------')
        console.log('| 0 - Sair')
        console.log('----------------------')
    }
}