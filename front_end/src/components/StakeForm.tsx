import { Button, CircularProgress, Input } from "@material-ui/core";
import { useEthers, useNotifications, useTokenBalance } from "@usedapp/core";
import { utils } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";
import { useStakeTokens } from "../hooks/useStakeTokens";
import { Token } from "./Main";

export interface StakeFormProps {
    token: Token;
}
export const StakeForm = ({ token }: StakeFormProps) => {
    const { address: tokenAddress, name } = token;
    const { account } = useEthers();

    const tokenBalance = useTokenBalance(tokenAddress, account);
    const formattedBalance: number = tokenBalance
        ? parseFloat(formatUnits(tokenBalance, 18))
        : 0;

    const { notifications } = useNotifications();

    const [amount, setAmount] = useState<
        number | string | Array<number | string>
    >(0);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount =
            event.target.value === "" ? "" : Number(event.target.value);
        setAmount(newAmount);
    };

    const { approveAndStake, state } = useStakeTokens(tokenAddress);

    const handleStakeSubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString());
        return approveAndStake(amountAsWei.toString());
    };

    const isProcessing = state.status === "Mining";

    useEffect(() => {
        if (
            notifications.filter(
                (notification) =>
                    notification.type === "transactionSucceed" &&
                    notification.transactionName === "Approve ERC20 transfer"
            ).length > 0
        ) {
            // approved
        }
        if (
            notifications.filter(
                (notification) =>
                    notification.type === "transactionSucceed" &&
                    notification.transactionName === "Stake Tokens"
            ).length > 0
        ) {
            // staked
        }
    }, [notifications]);

    return (
        <div>
            <Input onChange={handleInputChange} />
            <Button
                onClick={handleStakeSubmit}
                color="primary"
                size="large"
                disabled={isProcessing}
            >
                {isProcessing ? <CircularProgress size={26} /> : "Stake"}
            </Button>
        </div>
    );
};
