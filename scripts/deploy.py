from typing import Dict, Tuple

from brownie import TokenFarm, UselessToken, accounts, config, network
from brownie.network.contract import ProjectContract
from brownie.network.transaction import TransactionReceipt
from brownie.network.web3 import Web3

from scripts.util import get_account, get_contract

KEPT_BALANCE = Web3.toWei(100, "ether")


def main():
    deploy_token_farm_and_ust()


def deploy_token_farm_and_ust() -> Tuple[ProjectContract, ProjectContract]:
    account = get_account()

    ust_token: ProjectContract = UselessToken.deploy({"from": account})
    token_farm: ProjectContract = TokenFarm.deploy(
        ust_token.address,
        {"from": account},
        publish_source=config["networks"][network.show_active()]["verify"],
    )

    tx: TransactionReceipt = ust_token.transfer(
        token_farm.address, ust_token.totalSupply() - KEPT_BALANCE, {"from": account}
    )
    tx.wait(1)

    weth_token = get_contract("weth_token")
    fau_token = get_contract("fau_token")

    dict_of_allowed_tokens = {
        ust_token: get_contract("dai_usd_price_feed"),
        fau_token: get_contract("dai_usd_price_feed"),
        weth_token: get_contract("eth_usd_price_feed"),
    }

    add_allowed_tokens(token_farm, dict_of_allowed_tokens, account)

    return token_farm, ust_token


def add_allowed_tokens(
    token_farm: ProjectContract,
    allowed_tokens: Dict,
    account,
):
    for token in allowed_tokens:
        tx: TransactionReceipt = token_farm.addAllowedTokens(
            token.address, {"from": account}
        )
        tx.wait(1)

        set_tx: TransactionReceipt = token_farm.setPriceFeedContract(
            token.address, allowed_tokens[token], {"from": account}
        )
        set_tx.wait(1)

    return token_farm
