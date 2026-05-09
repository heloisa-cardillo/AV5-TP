import Menu from "../interfaces/menu";

export default class MenuClientes implements Menu {
    mostrar(): void {
        console.log('****************************')
        console.log('| 🥕🐇 Villa dos Coelhos - Clientes')
        console.log('----------------------')
        console.log('| 1 - Cadastrar cliente')
        console.log('| 2 - Editar cliente')
        console.log('| 3 - Listar cliente(s)')
        console.log('| 4 - Excluir cliente')
        console.log('----------------------')
        console.log('| 0 - Voltar')
        console.log('----------------------')
    }
}