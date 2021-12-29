import { Button, CircularProgress, Input, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
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

    const [showERC20ApprovalSuccess, setShowERC20ApprovalSuccess] =
        useState(false);
    const [showStakedTokensSuccess, setShowStakedTokensSuccess] =
        useState(false);

    useEffect(() => {
        if (
            notifications.filter(
                (notification) =>
                    notification.type === "transactionSucceed" &&
                    notification.transactionName === "Approve ERC20 transfer"
            ).length > 0
        ) {
            setShowERC20ApprovalSuccess(true);
            setShowStakedTokensSuccess(false);
        }
        if (
            notifications.filter(
                (notification) =>
                    notification.type === "transactionSucceed" &&
                    notification.transactionName === "Stake Tokens"
            ).length > 0
        ) {
            setShowERC20ApprovalSuccess(false);
            setShowStakedTokensSuccess(true);
        }
    }, [notifications, showERC20ApprovalSuccess, showStakedTokensSuccess]);

    const handleCloseSnack = () => {
        setShowERC20ApprovalSuccess(false);
        setShowStakedTokensSuccess(false);
    };

    return (
        <>
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

            <Snackbar
                open={showERC20ApprovalSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}
            >
                <Alert onClose={handleCloseSnack} severity="success">
                    ERC-20 Token transfer approved! Please confirm second
                    transaction.
                </Alert>
            </Snackbar>
            <Snackbar
                open={showStakedTokensSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}
            >
                <Alert onClose={handleCloseSnack} severity="success">
                    Tokens staked!
                </Alert>
            </Snackbar>
        </>
    );
};
