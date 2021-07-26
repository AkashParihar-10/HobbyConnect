const client = AgoraRTM.createInstance('fdbf45f5680c48608931b479ffa21eff');
var localUser = $("#localUser").html();
var remoteUser = $("#remoteUser").html();

client.on('ConnectionStateChanged', (newState, reason) => {
    console.log('on connection state changed to ' + newState + ' reason: ' + reason);
  });
  client.login({ token:null, uid:localUser }).then(() => {
    console.log('AgoraRTM client login success');
  }).catch(err => {
    console.log('AgoraRTM client login failure', err);
});
client.on('MessageFromPeer', ({ text }, peerId) => { // text: text of the received message; peerId: User ID of the sender.
    console.log("Message received successfully.");
    console.log("The message is: " + text + " by " + peerId);
    $("#messageBox").append(" <div class='d-flex flex-row p-3'><img src='https://img.icons8.com/color/48/000000/circled-user-male-skin-type-7.png' width='10%' height='30'><div class='chat chat-msg ml-2 p-3'>"+text+"</div></div>");

    //$("#messageBox").append("<br> <b>Sender:</b> " + peerId + "<br> <b>Message:</b> " + text + "<br>");
    /* Your code for handling the event of receiving a peer-to-peer message. */
});
$("#msg").keypress(function (e) {
    var key = e.which;
    if(key == 13)  // the enter key code
  {
    $('input[name = butAssignProd]').click();
    singleMessage = $('#msg').val();
    client.sendMessageToPeer(
        { text: singleMessage }, // An RtmMessage object.
        remoteUser, // The user ID of the remote user.
        ).then(sendResult => {
        if (sendResult.hasPeerReceived) {
            console.log("Message sent successfully.");
            $("#messageBox").append(" <div class='d-flex flex-row p-3'><div class='chat chat-msg ml-2 p-3'>"+singleMessage+"</div><img src='https://img.icons8.com/color/48/000000/circled-user-male-skin-type-7.png' width='10%' height='30'></div>");
            //$("#messageBox").append("<br> <b>Sender:</b> " + localUser + "<br> <b>Message:</b> " + singleMessage + "<br>");
            console.log("Your message was: " + singleMessage + " by " + localUser);
        /* Your code for handling the event that the remote user receives the message. */
        } else {
            console.log("Remote user cannot be reached ", error);
        /* Your code for handling the event that the message is received by the server but the remote user cannot be reached. */
        }
        }).catch(error => {
            console.log("Message wasn't sent due to an error: ", error);
        /* Your code for handling the event of a message send failure. */
        });
    return false;  
  }
    
   
});

