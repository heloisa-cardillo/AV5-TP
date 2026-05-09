import Menu from "../interfaces/menu";

export default class MenuPrincipal implements Menu {
    mostrar(): void {
        console.log(****************************)
        console.log(| Villa dos Coelhos)
        console.log(| Por favor, selecione uma opção...)
        console.log(----------------------)
        console.log(| Opções para cliente:)
        console.log(----------------------)
        console.log(| 1 - Cadastrar cliente)
        console.log(| 2 - Editar cliente)
        console.log(| 3 - Listar cliente(s))
        console.log(| 4 - Excluir cliente)
        console.log(----------------------)
        console.log(| Opções para hospedagem:)
        console.log(----------------------)
        console.log(| 5 - Listar acomodações)
        console.log(| 6 - Registrar hospedagem)
        console.log(| 7 - Listar hospedagens)
        console.log(----------------------)
        console.log(****************************)
        console.log(| 0 - Sair)
        console.log(----------------------)
    }
}
