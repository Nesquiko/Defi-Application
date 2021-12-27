from brownie import network
from brownie import exceptions
from scripts.deploy import deploy_token_farm_and_ust
from scripts.util import (
    INITIAL_PRICE_FEED_VALUE,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
    get_account,
    get_contract,
)
import pytest


def test_set_price_feed_contract():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local environment testing!")

    account = get_account()

    token_farm, ust_token = deploy_token_farm_and_ust()

    price_feed_address = get_contract("eth_usd_price_feed")
    token_farm.setPriceFeedContract(
        ust_token.address, price_feed_address, {"from": account}
    )

    assert token_farm.tokenPriceFeedMapping(ust_token.address) == price_feed_address


def test_set_price_feed_contract_not_owner():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local environment testing!")

    account = get_account()
    non_owner = get_account(index=1)

    token_farm, ust_token = deploy_token_farm_and_ust()

    price_feed_address = get_contract("eth_usd_price_feed")

    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.setPriceFeedContract(
            ust_token.address, price_feed_address, {"from": non_owner}
        )


def test_stake_tokens(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local environment testing!")
    account = get_account()
    token_farm, ust_token = deploy_token_farm_and_ust()

    ust_token.approve(token_farm.address, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, ust_token.address, {"from": account})

    assert (
        token_farm.stakingBalance(ust_token.address, account.address) == amount_staked
    )
    assert token_farm.uniqueTokensStaked(account.address) == 1
    assert token_farm.stakers(0) == account.address

    return token_farm, ust_token


def test_issue_token(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local environment testing!")
    account = get_account()
    token_farm, ust_token = test_stake_tokens(amount_staked)

    starting_bal = ust_token.balanceOf(account.address)

    token_farm.issueTokens({"from": account})

    assert (
        ust_token.balanceOf(account.address) == starting_bal + INITIAL_PRICE_FEED_VALUE
    )
