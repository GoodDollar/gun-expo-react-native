import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import crypto from "isomorphic-webcrypto";
import { Gun, SEA } from "gun";

export default function App() {
  let [state, setState] = useState({ decrypted: "", pair: "", random: "" });
  const runTests = async () => {
    try {
      console.log("running testdsss", crypto);
      crypto.subtle
        .generateKey(
          {
            name: "ECDSA",
            namedCurve: "P-256" //can be "P-256", "P-384", or "P-521"
          },
          true, //whether the key is extractable (i.e. can be used in exportKey)
          ["sign", "verify"] //can be any combination of "sign" and "verify"
        )
        .then(function(key) {
          //returns a keypair object
          console.log(key);
          console.log(key.publicKey);
          console.log(key.privateKey);
        })
        .catch(function(err) {
          console.error(err);
        });
      // await test();
      // await test2();
      await testTypes();
    } catch (e) {
      console.log("Test failed", e);
    }
  };
  const test = async () => {
    console.log("ok", { SEA, Gun, Buffer, atob, btoa });

    await crypto.ensureSecure();

    const array = new Uint8Array(10);
    let [random, pair] = await Promise.all([
      crypto.getRandomValues(array),
      SEA.pair()
    ]);
    const aeskey = await SEA.aeskey("x", "x");
    console.log({ aeskey });
    setState({ random, pair });
    let enc = await SEA.encrypt("hello self", pair);
    console.log({ pair, enc });
    let signed = await SEA.sign(enc, pair);
    console.log({ signed });
    let verified = await SEA.verify(signed, pair.pub);
    console.log({ verified });
    let decrypted = await SEA.decrypt(verified, pair);
    console.log({ decrypted });
    setState(prev => ({ ...prev, decrypted }));
  };

  const test2 = async () => {
    const alice = await SEA.pair();
    const bob = await SEA.pair();
    console.log({ alice, bob });
    console.log("Doing some work");
    const check = await SEA.work("hello self", alice);
    console.log("Done work", { check });
    const aes = await SEA.secret(bob.epub, alice);
    console.log({ aes });
    const shared = await SEA.encrypt("shared data", aes);
    const aes2 = await SEA.secret(alice.epub, bob);
    console.log({ shared, aes2 });
    const sharedDecrypted = await SEA.decrypt(shared, aes2);
    console.log({ sharedDecrypted });
    setState(prev => ({ ...prev, sharedDecrypted }));
  };

  const testQuickWrong = () => {
    return SEA.pair(function(alice) {
      SEA.pair(function(bob) {
        SEA.sign("asdf", alice, function(data) {
          SEA.verify(data, bob.pub, function(msg) {
            if (msg !== undefined)
              throw new Error("msg should equal undefined");
            SEA.verify(data + 1, alice.pub, function(msg) {
              if (msg !== undefined)
                throw new Error("msg should equal undefined");

              SEA.encrypt("secret", alice, function(enc) {
                SEA.decrypt(enc, bob, function(dec) {
                  if (dec !== undefined)
                    throw new Error("dec should equal undefined");
                  SEA.decrypt(enc + 1, alice, function(dec) {
                    if (dec !== undefined)
                      throw new Error("dec should equal undefined");
                  });
                });
              });
            });
          });
        });
      });
    });
  };
  const testTypes = () => {
    var pair, s, v;
    return SEA.pair(function(pair) {
      SEA.sign(null, pair, function(s) {
        SEA.verify(s, pair, function(v) {
          if (v !== null) throw new Error("bad value");
          SEA.sign(true, pair, function(s) {
            SEA.verify(s, pair, function(v) {
              if (v !== true) throw new Error("bad value");
              SEA.sign(false, pair, function(s) {
                SEA.verify(s, pair, function(v) {
                  if (v !== false) throw new Error("bad value");
                  SEA.sign(0, pair, function(s) {
                    SEA.verify(s, pair, function(v) {
                      if (v !== 0) throw new Error("bad value");
                      SEA.sign(1, pair, function(s) {
                        SEA.verify(s, pair, function(v) {
                          if (v !== 1) throw new Error("bad value");
                          SEA.sign(1.01, pair, function(s) {
                            SEA.verify(s, pair, function(v) {
                              if (v !== 1.01) throw new Error("bad value");
                              SEA.sign("", pair, function(s) {
                                SEA.verify(s, pair, function(v) {
                                  if (v !== "") throw new Error("bad value");
                                  SEA.sign("a", pair, function(s) {
                                    SEA.verify(s, pair, function(v) {
                                      if (v !== "a")
                                        throw new Error("bad value");
                                      SEA.sign([], pair, function(s) {
                                        SEA.verify(s, pair, function(v) {
                                          if (v.length != 0) {
                                            console.log({ v });
                                            throw new Error(`bad value ${v}`);
                                          }
                                          SEA.sign([1], pair, function(s) {
                                            SEA.verify(s, pair, function(v) {
                                              if (v[0] != 1)
                                                throw new Error(
                                                  `bad value ${v}`
                                                );
                                              SEA.sign({}, pair, function(s) {
                                                SEA.verify(s, pair, function(
                                                  v
                                                ) {
                                                  if (typeof v !== "object")
                                                    throw new Error(
                                                      `bad value ${v}`
                                                    );
                                                  SEA.sign(
                                                    { a: 1 },
                                                    pair,
                                                    function(s) {
                                                      SEA.verify(
                                                        s,
                                                        pair,
                                                        function(v) {
                                                          if (v.a != 1)
                                                            throw new Error(
                                                              `bad value ${v}`
                                                            );
                                                          SEA.sign(
                                                            JSON.stringify({
                                                              a: 1
                                                            }),
                                                            pair,
                                                            function(s) {
                                                              SEA.verify(
                                                                s,
                                                                pair,
                                                                function(v) {
                                                                  if (v.a != 1)
                                                                    throw new Error(
                                                                      `bad value ${v}`
                                                                    );
                                                                }
                                                              );
                                                            }
                                                          );
                                                        }
                                                      );
                                                    }
                                                  );
                                                });
                                              });
                                            });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  };
  return (
    <View style={styles.container}>
      <Text>Openx up App.js to start working on your app!</Text>
      <Text>Random: {state.random && state.random.toString()}</Text>
      <Text>SEA Pair: {state.pair && JSON.stringify(state.pair)}</Text>
      <Text>Decrypted: {state.decrypted && state.decrypted}</Text>
      <Text>Shared: {state.sharedDecrypted && state.sharedDecrypted}</Text>
      <Button onPress={runTests} title={"Run SEA tests"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
