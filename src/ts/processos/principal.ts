import Processo from "../abstracoes/processo"
import CadastroAcomodacoes from "./cadastroAcomodacoes"
import CadastroHospedagem from "./cadastroHospedagem"
import ListagemAcomodacoes from "./listagemAcomodacoes"
import ListagemHospedagens from "./listagemHospedagens"
import MenuPrincipal from "../menus/menuPricipal"
import MenuClientes from "../menus/menuClientes"
import MenuHospedagem from "../menus/menuHospedagem"
import TipoCadastroCliente from "./tipoCadastroCliente"
import TipoListagemClientes from "./tipoListagemClientes"

export default class Principal extends Processo {
    constructor() {
        super()
        this.execucao = true
        this.menu = new MenuPrincipal()
        new CadastroAcomodacoes().processar()
    }

    private menuClientes(): void {
        let opcao = -1
        while (opcao !== 0) {
            new MenuClientes().mostrar()
            opcao = this.entrada.receberNumero('Qual opcao desejada?')
            switch (opcao) {
                case 1:
                    this.processo = new TipoCadastroCliente()
                    this.processo.processar()
                    break
                case 3:
                    this.processo = new TipoListagemClientes()
                    this.processo.processar()
                    break
                case 0:
                    break
                default:
                    console.log('Opcao nao entendida :(')
            }
        }
    }

    private menuHospedagem(): void {
        let opcao = -1
        while (opcao !== 0) {
            new MenuHospedagem().mostrar()
            opcao = this.entrada.receberNumero('Qual opcao desejada?')
            switch (opcao) {
                case 1:
                    this.processo = new ListagemAcomodacoes()
                    this.processo.processar()
                    break
                case 2:
                    this.processo = new CadastroHospedagem()
                    this.processo.processar()
                    break
                case 3:
                    this.processo = new ListagemHospedagens()
                    this.processo.processar()
                    break
                case 0:
                    break
                default:
                    console.log('Opcao nao entendida :(')
            }
        }
    }

    processar(): void {
        this.menu.mostrar()
        this.opcao = this.entrada.receberNumero('Qual opcao desejada?')
        switch (this.opcao) {
            case 1:
                this.menuClientes()
                break
            case 2:
                this.menuHospedagem()
                break
            case 412:
                console.log('  (\\(\\')
                console.log('  ( ^.^)')
                console.log('  o_(")(") ')
                break
            case 0:
                this.execucao = false
                console.log('Ate logo!')
                console.clear()
                break
            default:
                console.log('Opcao nao entendida :(')
        }
    }
}