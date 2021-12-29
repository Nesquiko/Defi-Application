import { useEthers } from "@usedapp/core";
import helperConfig from "../help_config.json";
import networkMapping from "../chain-info/deployments/map.json";
import { constants } from "ethers";
import brownieConfig from "../brownie-config.json";
import dapp from "../dapp.png";
import eth from "../eth.png";
import dai from "../dai.png";
import { YourWallet } from "./yourWallet/YourWallet";
import { makeStyles } from "@material-ui/core";

export type Token = {
    image: string;
    address: string;
    name: string;
};

const useStyles = makeStyles((theme) => ({
    title: {
        color: theme.palette.common.white,
        textAlign: "center",
        padding: theme.spacing(4),
    },
}));

export const Main = () => {
    const classes = useStyles();
    const { chainId, error } = useEthers();

    const networkName = chainId ? helperConfig[chainId] : "dev";

    const ustTokenAddress = chainId
        ? networkMapping[String(chainId)]["UselessToken"][0]
        : constants.AddressZero;

    const wethTokenAddress = chainId
        ? brownieConfig["networks"][networkName]["weth_token"]
        : constants.AddressZero;

    const fauTokenAddress = chainId
        ? brownieConfig["networks"][networkName]["fau_token"]
        : constants.AddressZero;

    const supportedTokens: Array<Token> = [
        { image: dapp, address: ustTokenAddress, name: "UST" },
        { image: eth, address: wethTokenAddress, name: "WETH" },
        { image: dai, address: fauTokenAddress, name: "DAI" },
    ];
    return (
        <>
            <h2 className={classes.title}>Useless Token App</h2>
            <YourWallet supportedTokens={supportedTokens} />
        </>
    );
};
