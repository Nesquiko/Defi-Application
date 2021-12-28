import { Button, Input } from "@material-ui/core";
import { useEthers, useTokenBalance } from "@usedapp/core";
import { utils } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import React, { useState } from "react";
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

    const [amount, setAmount] = useState<
        number | string | Array<number | string>
    >(0);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount =
            event.target.value === "" ? "" : Number(event.target.value);
        setAmount(newAmount);
    };

    const { approveAndStake, approveErc20State } = useStakeTokens(tokenAddress);
    const handleStakeSubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString());
        return approveAndStake(amountAsWei.toString());
    };

    return (
        <div>
            <Input onChange={handleInputChange} />
            <Button onClick={handleStakeSubmit} color="primary" size="large">
                STAKE
            </Button>
        </div>
    );
};
